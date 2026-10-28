<?php

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
                // Without relations: permission checks load roles and permissions on the user, which the page doesn't need.
                'user' => $request->user()?->withoutRelations(),
                'permissions' => fn (): array => $this->permissions($request),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * The current user's effective permissions, used by the frontend to show or hide navigation.
     * They go through `can()`, so the admin (Gate::before) gets every permission. Shared lazily,
     * so partial reloads that don't ask for `auth` skip the query.
     *
     * @return list<string>
     */
    private function permissions(Request $request): array
    {
        $user = $request->user();

        if ($user === null) {
            return [];
        }

        return array_values(Permission::query()
            ->orderBy('name')
            ->get(['name'])
            ->map(fn (Permission $permission): string => $permission->name)
            ->filter(fn (string $name): bool => $user->can($name))
            ->all());
    }
}
