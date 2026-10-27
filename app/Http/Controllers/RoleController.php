<?php

namespace App\Http\Controllers;

use App\Http\Requests\Roles\StoreRoleRequest;
use App\Http\Requests\Roles\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\RouteAttributes\Attributes\Middleware;
use Spatie\RouteAttributes\Attributes\Resource;

#[Middleware(['auth', 'verified'])]
#[Resource(resource: 'roles', except: ['show'])]
class RoleController extends Controller
{
    /**
     * Roles that can't be renamed or deleted from the UI.
     *
     * @var list<string>
     */
    public const array PROTECTED_ROLES = ['admin'];

    /**
     * Show the roles list.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::query()
            ->withCount('permissions')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions_count' => $role->permissions_count,
                'is_protected' => $this->isProtected($role),
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

        return Inertia::render('roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
                'is_protected' => $this->isProtected($role),
            ],
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    /**
     * Update a role's name and permissions. Protected roles keep their name.
     */
    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        if (! $this->isProtected($role)) {
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

        abort_if($this->isProtected($role), 403, __('Questo ruolo è protetto e non può essere eliminato.'));

        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Ruolo eliminato.')]);

        return to_route('roles.index');
    }

    /**
     * Determine whether the role is protected from renaming and deletion.
     */
    private function isProtected(Role $role): bool
    {
        return in_array($role->name, self::PROTECTED_ROLES, true);
    }

    /**
     * All permissions, grouped by resource (the part before the dot, e.g. `users` in `users.view`).
     *
     * @return Collection<int, array{group: string, permissions: list<array{id: int, name: string, action: string}>}>
     */
    private function permissionGroups(): Collection
    {
        return Permission::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->groupBy(fn (Permission $permission): string => explode('.', $permission->name)[0])
            ->map(fn (Collection $permissions, string $group): array => [
                'group' => $group,
                'permissions' => array_values($permissions
                    ->map(fn (Permission $permission): array => [
                        'id' => (int) $permission->id,
                        'name' => $permission->name,
                        'action' => explode('.', $permission->name)[1] ?? $permission->name,
                    ])
                    ->all()),
            ])
            ->values();
    }
}
