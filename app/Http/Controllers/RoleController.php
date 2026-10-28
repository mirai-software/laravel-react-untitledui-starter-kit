<?php

namespace App\Http\Controllers;

use App\Http\Requests\Roles\StoreRoleRequest;
use App\Http\Requests\Roles\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\RouteAttributes\Attributes\Middleware;
use Spatie\RouteAttributes\Attributes\Resource;

#[Middleware(['auth', 'verified'])]
#[Resource(resource: 'roles', except: ['show'])]
class RoleController extends Controller
{
    /**
     * Show the roles list, with what the current user can do on each row.
     * The admin role has every permission, so it can't be edited; protected roles can't be deleted.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Role::class);

        $user = $request->user();

        $roles = Role::query()
            ->withCount('permissions')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions_count' => $role->permissions_count,
                'has_all_permissions' => $role->isAdmin(),
                'is_protected' => $role->isProtected(),
                'can' => [
                    'update' => ! $role->isAdmin() && ($user?->can('update', $role) ?? false),
                    'delete' => ! $role->isProtected() && ($user?->can('delete', $role) ?? false),
                ],
            ]);

        return Inertia::render('roles/index', [
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form to create a role.
     */
    public function create(): Response
    {
        $this->authorize('create', Role::class);

        return Inertia::render('roles/create', [
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    /**
     * Store a new role with its permissions.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create(['name' => $request->validated('name')]);
        $role->syncPermissions($request->validated('permissions', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ruolo creato.')]);

        return to_route('roles.index');
    }

    /**
     * Show the form to edit a role.
     */
    public function edit(Role $role): Response
    {
        $this->authorize('update', $role);

        abort_if($role->isAdmin(), 403, __('Il ruolo di amministratore ha sempre tutti i permessi e non si modifica.'));

        return Inertia::render('roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
                'is_protected' => $role->isProtected(),
            ],
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    /**
     * Update a role's name and permissions. Protected roles keep their name; the admin role
     * can't be changed at all (UpdateRoleRequest).
     */
    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        if (! $role->isProtected()) {
            $role->update(['name' => $request->validated('name')]);
        }

        $role->syncPermissions($request->validated('permissions', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ruolo aggiornato.')]);

        return to_route('roles.index');
    }

    /**
     * Delete a role. Protected roles can't be deleted.
     */
    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('delete', $role);

        abort_if($role->isProtected(), 403, __('Questo ruolo è protetto e non può essere eliminato.'));

        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ruolo eliminato.')]);

        return to_route('roles.index');
    }

    /**
     * All permissions, grouped by resource: the part before the first dot (`users` in `users.view`);
     * the rest is the action (`view`, or `sales.export` in `reports.sales.export`).
     *
     * @return Collection<int, array{group: string, permissions: list<array{id: int, name: string, action: string}>}>
     */
    private function permissionGroups(): Collection
    {
        return Permission::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->groupBy(fn (Permission $permission): string => Str::before($permission->name, '.'))
            ->map(fn (Collection $permissions, string $group): array => [
                'group' => $group,
                'permissions' => array_values($permissions
                    ->map(fn (Permission $permission): array => [
                        'id' => (int) $permission->id,
                        'name' => $permission->name,
                        'action' => Str::after($permission->name, '.'),
                    ])
                    ->all()),
            ])
            ->values();
    }
}
