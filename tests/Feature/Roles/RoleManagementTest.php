<?php

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

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('roles.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_users_without_permission_cannot_view_roles()
    {
        $response = $this->actingAs(User::factory()->create())->get(route('roles.index'));

        $response->assertForbidden();
    }

    public function test_users_with_the_view_permission_see_the_roles_list()
    {
        Role::findOrCreate(Role::ADMIN);

        $response = $this->actingAs($this->userWith(['roles.view']))->get(route('roles.index'));

        $response->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('roles/index')
            ->where('roles.0.name', Role::ADMIN)
            ->where('roles.0.is_protected', true)
            ->where('roles.0.has_all_permissions', true)
            ->where('roles.0.can', ['update' => false, 'delete' => false]));
    }

    public function test_the_admin_role_cannot_be_edited()
    {
        $role = Role::findOrCreate(Role::ADMIN);

        $this->actingAs($this->admin())->get(route('roles.edit', $role))->assertForbidden();
        $this->actingAs($this->admin())->put(route('roles.update', $role), [
            'name' => Role::ADMIN,
            'permissions' => ['roles.view'],
        ])->assertForbidden();
    }

    public function test_admins_pass_every_permission_check()
    {
        $response = $this->actingAs($this->admin())->get(route('roles.create'));

        $response->assertOk();
    }

    public function test_roles_can_be_created_with_permissions()
    {
        Permission::findOrCreate('roles.view');
        Permission::findOrCreate('roles.update');

        $response = $this->actingAs($this->userWith(['roles.create']))->post(route('roles.store'), [
            'name' => 'editor',
            'permissions' => ['roles.view', 'roles.update'],
        ]);

        $response->assertRedirect(route('roles.index'));
        $this->assertEqualsCanonicalizing(
            ['roles.view', 'roles.update'],
            Role::findByName('editor')->permissions->pluck('name')->all(),
        );
    }

    public function test_users_without_the_create_permission_cannot_create_roles()
    {
        $response = $this->actingAs($this->userWith(['roles.view']))->post(route('roles.store'), ['name' => 'editor']);

        $response->assertForbidden();
        $this->assertDatabaseMissing('roles', ['name' => 'editor']);
    }

    public function test_role_names_must_be_unique()
    {
        Role::findOrCreate('editor');

        $response = $this->actingAs($this->userWith(['roles.create']))->post(route('roles.store'), ['name' => 'editor']);

        $response->assertSessionHasErrors('name');
    }

    public function test_roles_can_be_renamed_and_their_permissions_changed()
    {
        Permission::findOrCreate('roles.view');
        Permission::findOrCreate('roles.update');
        $role = Role::findOrCreate('editor');
        $role->givePermissionTo('roles.view');

        $response = $this->actingAs($this->userWith(['roles.update']))->put(route('roles.update', $role), [
            'name' => 'redattore',
            'permissions' => ['roles.update'],
        ]);

        $response->assertRedirect(route('roles.index'));
        $role->refresh();
        $this->assertSame('redattore', $role->name);
        $this->assertEqualsCanonicalizing(['roles.update'], $role->permissions->pluck('name')->all());
    }

    public function test_protected_roles_keep_their_name()
    {
        $role = Role::findOrCreate(Role::USER);

        $response = $this->actingAs($this->userWith(['roles.update']))->put(route('roles.update', $role), [
            'name' => 'superuser',
            'permissions' => [],
        ]);

        $response->assertRedirect(route('roles.index'));
        $this->assertSame(Role::USER, $role->fresh()?->name);
    }

    public function test_roles_can_be_deleted()
    {
        $role = Role::findOrCreate('editor');

        $response = $this->actingAs($this->userWith(['roles.delete']))->delete(route('roles.destroy', $role));

        $response->assertRedirect(route('roles.index'));
        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_protected_roles_cannot_be_deleted()
    {
        foreach (Role::PROTECTED as $name) {
            $role = Role::findOrCreate($name);

            $response = $this->actingAs($this->admin())->delete(route('roles.destroy', $role));

            $response->assertForbidden();
            $this->assertDatabaseHas('roles', ['id' => $role->id]);
        }
    }

    public function test_users_without_the_update_or_delete_permission_cannot_change_roles()
    {
        $role = Role::findOrCreate('editor');
        $viewer = $this->userWith(['roles.view']);

        $this->actingAs($viewer)->put(route('roles.update', $role), ['name' => 'redattore'])->assertForbidden();
        $this->actingAs($viewer)->delete(route('roles.destroy', $role))->assertForbidden();

        $this->assertSame('editor', $role->fresh()?->name);
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

    private function admin(): User
    {
        return User::factory()->create()->assignRole(Role::findOrCreate(Role::ADMIN));
    }
}
