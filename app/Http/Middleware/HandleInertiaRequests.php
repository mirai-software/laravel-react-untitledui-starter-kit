<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user'        => $request->user(),
                'permissions' => $this->permissions($request),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * Permessi effettivi dell'utente, usati lato client per filtrare la
     * navigazione. Il filtro passa per `can()`, quindi l'admin
     * (bypass via Gate::before) riceve correttamente tutti i permessi.
     *
     * @return list<string>
     */
    private function permissions(Request $request): array
    {
        $user = $request->user();

        if ($user === null) {
            return [];
        }

        return Permission::query()
            ->orderBy('name')
            ->pluck('name')
            ->filter(fn (string $name): bool => $user->can($name))
            ->values()
            ->all();
    }
}
