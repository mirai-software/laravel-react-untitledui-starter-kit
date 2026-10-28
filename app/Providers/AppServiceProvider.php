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
     * - An expired page (419) goes back with a toast, so the user doesn't lose the form.
     * - With debug on, Laravel's detailed error page is kept for the other errors.
     */
    protected function configureErrorPages(): void
    {
        Inertia::handleExceptionsUsing(function (ExceptionResponse $response): ?SymfonyResponse {
            $request = $response->request;

            if ($request->expectsJson() && ! $request->hasHeader('X-Inertia')) {
                return null;
            }

            if ($response->statusCode() === 419) {
                Inertia::flash('toast', ['type' => 'error', 'message' => __('La pagina è scaduta: riprova.')]);

                return back();
            }

            if (config('app.debug') || ! in_array($response->statusCode(), [403, 404, 429, 500, 503], true)) {
                return null;
            }

            // The page needs the shared data, and so the database: if rendering fails too
            // (e.g. the database is down), fall back to Laravel's plain error response.
            return rescue(
                fn (): SymfonyResponse => $response
                    ->render('error', ['status' => $response->statusCode()])
                    ->withSharedData()
                    ->toResponse($request),
                $response->response,
            );
        });
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
