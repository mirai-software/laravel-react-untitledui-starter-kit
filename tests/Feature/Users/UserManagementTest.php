<?php

declare(strict_types=1);

namespace Tests\Feature\Users;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_without_permission_cannot_list_users(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('users.index'))
            ->assertForbidden();
    }

    public function test_user_with_permission_sees_users_index(): void
    {
        $this->actingAs($this->userWith('users.view'))
            ->get(route('users.index'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page): AssertableInertia => $page
                    ->component('users/index')
                    ->has('users'),
            );
    }

    public function test_user_without_permission_cannot_create_users(): void
    {
        $this->actingAs($this->userWith('users.view'))
            ->post(route('users.store'), $this->validPayload())
            ->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'nuovo@example.com']);
    }

    public function test_user_with_permission_can_create_user_with_roles(): void
    {
        Role::findOrCreate('admin');

        $this->actingAs($this->userWith('users.create'))
            ->post(route('users.store'), $this->validPayload(['roles' => ['admin']]))
            ->assertRedirect(route('users.index'));

        $created = User::query()->where('email', 'nuovo@example.com')->firstOrFail();

        $this->assertSame('Nuovo Utente', $created->name);
        $this->assertTrue($created->hasRole('admin'));
        $this->assertTrue(Hash::check('secret-password', $created->password));
    }

    public function test_store_validates_required_fields_and_unique_email(): void
    {
        $existing = User::factory()->create();

        $this->actingAs($this->userWith('users.create'))
            ->post(route('users.store'), $this->validPayload(['email' => $existing->email]))
            ->assertSessionHasErrors('email');
    }

    public function test_user_with_permission_can_update_user_and_keep_password(): void
    {
        Role::findOrCreate('admin');
        Role::findOrCreate('user');

        $target = User::factory()->create();
        $target->assignRole('user');
        $originalPassword = $target->password;

        $this->actingAs($this->userWith('users.update'))
            ->put(route('users.update', $target), [
                'name'                  => 'Nome Aggiornato',
                'email'                 => 'aggiornato@example.com',
                'password'              => '',
                'password_confirmation' => '',
                'roles'                 => ['admin'],
            ])
            ->assertRedirect(route('users.index'));

        $target->refresh();

        $this->assertSame('Nome Aggiornato', $target->name);
        $this->assertSame('aggiornato@example.com', $target->email);
        $this->assertSame($originalPassword, $target->password);
        $this->assertEqualsCanonicalizing(['admin'], $target->getRoleNames()->all());
    }

    public function test_update_changes_password_when_provided(): void
    {
        $target = User::factory()->create();

        $this->actingAs($this->userWith('users.update'))
            ->put(route('users.update', $target), [
                'name'                  => $target->name,
                'email'                 => $target->email,
                'password'              => 'brand-new-password',
                'password_confirmation' => 'brand-new-password',
                'roles'                 => [],
            ])
            ->assertRedirect(route('users.index'));

        $this->assertTrue(Hash::check('brand-new-password', $target->fresh()->password));
    }

    public function test_user_with_permission_can_deactivate_user(): void
    {
        $target = User::factory()->create();

        $this->actingAs($this->userWith('users.delete'))
            ->delete(route('users.destroy', $target))
            ->assertRedirect(route('users.index'));

        $this->assertSoftDeleted($target);
    }

    public function test_user_cannot_deactivate_themselves(): void
    {
        $actor = $this->userWith('users.delete');

        $this->actingAs($actor)
            ->delete(route('users.destroy', $actor))
            ->assertForbidden();

        $this->assertNotSoftDeleted($actor);
    }

    public function test_user_with_permission_can_restore_user(): void
    {
        $target = User::factory()->create();
        $target->delete();

        $this->actingAs($this->userWith('users.delete'))
            ->put(route('users.restore', $target))
            ->assertRedirect(route('users.index'));

        $this->assertNotSoftDeleted($target->fresh());
    }

    public function test_admin_can_manage_users(): void
    {
        Role::findOrCreate('admin');
        $admin = User::factory()->create();
        $admin->assignRole(Role::findOrCreate('admin'));

        $this->actingAs($admin)
            ->post(route('users.store'), $this->validPayload(['roles' => ['admin']]))
            ->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', ['email' => 'nuovo@example.com']);
    }

    public function test_shared_permissions_reflect_user_abilities(): void
    {
        $this->actingAs($this->userWith('users.view'))
            ->get(route('users.index'))
            ->assertInertia(
                fn (AssertableInertia $page): AssertableInertia => $page
                    ->where('auth.permissions', ['users.view']),
            );
    }

    public function test_admin_receives_all_permissions(): void
    {
        foreach (['roles.view', 'users.create', 'users.view'] as $permission) {
            Permission::findOrCreate($permission);
        }

        $admin = User::factory()->create();
        $admin->assignRole(Role::findOrCreate('admin'));

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertInertia(
                fn (AssertableInertia $page): AssertableInertia => $page
                    ->where('auth.permissions', ['roles.view', 'users.create', 'users.view']),
            );
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return [
            'name'                  => 'Nuovo Utente',
            'email'                 => 'nuovo@example.com',
            'password'              => 'secret-password',
            'password_confirmation' => 'secret-password',
            'roles'                 => [],
            ...$overrides,
        ];
    }

    private function userWith(string $permission): User
    {
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate($permission));

        return $user;
    }
}
