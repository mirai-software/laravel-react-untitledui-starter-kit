<?php

declare(strict_types=1);

namespace Tests\Feature\Roles;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class RoleManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_roles_index(): void
    {
        $this->get(route('roles.index'))->assertRedirect(route('login'));
    }

    public function test_user_without_permission_cannot_view_roles(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('roles.index'))
            ->assertForbidden();
    }

    public function test_user_with_view_permission_sees_roles_index(): void
    {
        $this->actingAs($this->userWith(['roles.view']))
            ->get(route('roles.index'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page): AssertableInertia => $page
                    ->component('roles/index')
                    ->has('roles'),
            );
    }

    public function test_super_admin_bypasses_permission_checks(): void
    {
        $this->actingAs($this->superAdmin())
            ->get(route('roles.index'))
            ->assertOk();
    }

    public function test_user_with_create_permission_can_store_role_with_permissions(): void
    {
        Permission::findOrCreate('roles.view');
        Permission::findOrCreate('roles.update');

        $this->actingAs($this->userWith(['roles.create']))
            ->post(route('roles.store'), [
                'name'        => 'editor',
                'permissions' => ['roles.view', 'roles.update'],
            ])
            ->assertRedirect(route('roles.index'));

        $role = Role::findByName('editor');

        $this->assertEqualsCanonicalizing(
            ['roles.view', 'roles.update'],
            $role->permissions->pluck('name')->all(),
        );
    }

    public function test_user_without_create_permission_cannot_store_role(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('roles.store'), ['name' => 'editor'])
            ->assertForbidden();

        $this->assertDatabaseMissing('roles', ['name' => 'editor']);
    }

    public function test_store_validates_unique_name(): void
    {
        Role::findOrCreate('editor');

        $this->actingAs($this->userWith(['roles.create']))
            ->post(route('roles.store'), ['name' => 'editor'])
            ->assertSessionHasErrors('name');
    }

    public function test_role_permissions_can_be_updated(): void
    {
        Permission::findOrCreate('roles.view');
        Permission::findOrCreate('roles.update');
        $role = Role::findOrCreate('editor');
        $role->givePermissionTo('roles.view');

        $this->actingAs($this->userWith(['roles.update']))
            ->put(route('roles.update', $role), [
                'name'        => 'redattore',
                'permissions' => ['roles.update'],
            ])
            ->assertRedirect(route('roles.index'));

        $role->refresh();

        $this->assertSame('redattore', $role->name);
        $this->assertEqualsCanonicalizing(
            ['roles.update'],
            $role->permissions->pluck('name')->all(),
        );
    }

    public function test_role_can_be_deleted(): void
    {
        $role = Role::findOrCreate('editor');

        $this->actingAs($this->userWith(['roles.delete']))
            ->delete(route('roles.destroy', $role))
            ->assertRedirect(route('roles.index'));

        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_protected_super_admin_role_cannot_be_deleted(): void
    {
        $role = Role::findOrCreate('super-admin');

        $this->actingAs($this->userWith(['roles.delete']))
            ->delete(route('roles.destroy', $role))
            ->assertForbidden();

        $this->assertDatabaseHas('roles', ['id' => $role->id]);
    }

    /**
     * @param  list<string>  $permissions
     */
    private function userWith(array $permissions): User
    {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            $user->givePermissionTo(Permission::findOrCreate($permission));
        }

        return $user;
    }

    private function superAdmin(): User
    {
        $user = User::factory()->create();
        $user->assignRole(Role::findOrCreate('super-admin'));

        return $user;
    }
}
