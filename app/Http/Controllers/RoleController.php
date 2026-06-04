<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    /**
     * Ruoli che non possono essere eliminati o rinominati dalla UI.
     *
     * @var list<string>
     */
    private const array PROTECTED_ROLES = ['super-admin'];

    public function index(): Response
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::query()
            ->withCount('permissions')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Role $role): array => [
                'id'                => $role->id,
                'name'              => $role->name,
                'permissions_count' => $role->permissions_count,
                'is_protected'      => in_array($role->name, self::PROTECTED_ROLES, true),
            ]);

        return Inertia::render('roles/index', [
            'roles' => $roles,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Role::class);

        return Inertia::render('roles/create', [
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $role = Role::create(['name' => $request->validated('name')]);
        $role->syncPermissions($request->validated('permissions', []));

        return to_route('roles.index');
    }

    public function edit(Role $role): Response
    {
        $this->authorize('update', $role);

        return Inertia::render('roles/edit', [
            'role' => [
                'id'           => $role->id,
                'name'         => $role->name,
                'permissions'  => $role->permissions->pluck('name'),
                'is_protected' => in_array($role->name, self::PROTECTED_ROLES, true),
            ],
            'permissionGroups' => $this->permissionGroups(),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $name = in_array($role->name, self::PROTECTED_ROLES, true)
            ? $role->name
            : $request->validated('name');

        $role->update(['name' => $name]);
        $role->syncPermissions($request->validated('permissions', []));

        return to_route('roles.index');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->authorize('delete', $role);

        abort_if(
            in_array($role->name, self::PROTECTED_ROLES, true),
            403,
            'Questo ruolo è protetto e non può essere eliminato.',
        );

        $role->delete();

        return to_route('roles.index');
    }

    /**
     * Tutti i permessi raggruppati per risorsa (prefisso prima del punto).
     *
     * @return Collection<int, array{group: string, permissions: array<int, array{id: int, name: string, action: string}>}>
     */
    private function permissionGroups(): Collection
    {
        return Permission::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->groupBy(fn (Permission $permission): string => explode('.', $permission->name)[0])
            ->map(fn (Collection $permissions, string $group): array => [
                'group'       => $group,
                'permissions' => $permissions
                    ->map(fn (Permission $permission): array => [
                        'id'     => (int) $permission->id,
                        'name'   => $permission->name,
                        'action' => explode('.', $permission->name)[1] ?? $permission->name,
                    ])
                    ->values()
                    ->all(),
            ])
            ->values();
    }
}
