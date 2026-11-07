<?php

namespace App\Providers;

use App\Models\Passkey;
use App\Models\Role;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\ExceptionResponse;
use Inertia\Inertia;
use Laravel\Passkeys\Contracts\PasskeyUser;
use Laravel\Passkeys\Passkeys;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureAuthorization();
        $this->configureErrorPages();
        $this->configurePasskeys();
        $this->configureTesting();
    }

    /**
     * Let the `admin` role pass every authorization check.
     */
    protected function configureAuthorization(): void
    {
        Gate::before(fn (User $user): ?bool => $user->hasRole(Role::ADMIN) ? true : null);
    }

    /**
     * Render HTTP errors with the Inertia error page (resources/js/pages/error.tsx).
     *
     * - JSON requests (e.g. the passkey library's calls) keep Laravel's JSON errors.
     * - An expired page (419), or an action refused from a list row or a form (a 403 that isn't a GET),
     *   goes back with a toast, so the user keeps the list's filters or the form.
     * - With debug on, Laravel's detailed error page is kept for the other errors.
     */
    protected function configureErrorPages(): void
    {
        Inertia::handleExceptionsUsing(function (ExceptionResponse $response): ?SymfonyResponse {
            $request = $response->request;
            $explanation = $this->errorExplanation($response->exception);

            if ($request->expectsJson() && ! $request->hasHeader('X-Inertia')) {
                return null;
            }

            if ($response->statusCode() === 419) {
                Inertia::flash('toast', ['type' => 'error', 'message' => __('La pagina è scaduta: riprova.')]);

                return back();
            }

            if ($response->statusCode() === 403 && $request->hasHeader('X-Inertia') && ! $request->isMethod('GET')) {
                Inertia::flash('toast', ['type' => 'error', 'message' => $explanation ?? __('Non hai i permessi per questa azione.')]);

                return back();
            }

            if (config('app.debug') || ! in_array($response->statusCode(), [403, 404, 405, 413, 429, 500, 503], true)) {
                return null;
            }

            // The page needs the shared data, and so the database: if rendering fails too
            // (e.g. the database is down), fall back to Laravel's plain error response.
            return rescue(
                fn (): SymfonyResponse => $response
                    ->render('error', ['status' => $response->statusCode(), 'message' => $explanation])
                    ->withSharedData()
                    ->toResponse($request),
                $response->response,
            );
        });
    }

    /**
     * The message of an abort() that has one, e.g. abort_if(…, 403, __('…')): ours, in Italian. Null for
     * any other exception: Laravel's and the packages' messages are in English ("This action is
     * unauthorized.", spatie's permission middleware) and may name classes ("No query results for model …").
     */
    private function errorExplanation(Throwable $exception): ?string
    {
        $isAbort = $exception::class === HttpException::class && $exception->getPrevious() === null;

        return $isAbort && $exception->getMessage() !== '' ? $exception->getMessage() : null;
    }

    /**
     * Refuse passkey sign-ins for deactivated (soft-deleted) users, like password sign-ins.
     */
    protected function configurePasskeys(): void
    {
        Passkeys::usePasskeyModel(Passkey::class);
        Passkeys::authorizeLoginUsing(fn (Request $request, PasskeyUser $user): bool => ! ($user instanceof User && $user->trashed()));
    }

    /**
     * Tests don't render pages on the server: with `npm run dev` running, that would call Vite
     * over HTTP, which essentials' PreventStrayRequests blocks in tests.
     */
    protected function configureTesting(): void
    {
        Inertia::disableSsr($this->app->runningUnitTests());
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
