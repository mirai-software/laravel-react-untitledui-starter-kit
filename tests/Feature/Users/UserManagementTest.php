<?php

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

    public function test_users_without_permission_cannot_list_users()
    {
        $response = $this->actingAs(User::factory()->create())->get(route('users.index'));

        $response->assertForbidden();
    }

    public function test_users_with_the_view_permission_see_all_users_including_deactivated_ones()
    {
        $deactivated = User::factory()->create();
        $deactivated->delete();
        $viewer = $this->userWith('users.view');

        $response = $this->actingAs($viewer)->get(route('users.index'));

        $response->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('users/index')
            ->has('users', 2)
            ->where('users', fn ($users) => collect($users)->contains(
                fn (array $user) => $user['id'] === $deactivated->id && $user['is_active'] === false,
            ) && collect($users)->contains(
                fn (array $user) => $user['id'] === $viewer->id && $user['is_current_user'] === true,
            )));
    }

    public function test_users_can_be_created_with_roles()
    {
        Role::findOrCreate('admin');

        $response = $this->actingAs($this->userWith('users.create'))
            ->post(route('users.store'), $this->validPayload(['roles' => ['admin']]));

        $response->assertRedirect(route('users.index'));
        $created = User::where('email', 'nuovo@example.com')->firstOrFail();
        $this->assertSame('Nuovo Utente', $created->name);
        $this->assertTrue($created->hasRole('admin'));
        $this->assertTrue(Hash::check('secret-password', $created->password));
    }

    public function test_users_without_the_create_permission_cannot_create_users()
    {
        $response = $this->actingAs($this->userWith('users.view'))->post(route('users.store'), $this->validPayload());

        $response->assertForbidden();
        $this->assertDatabaseMissing('users', ['email' => 'nuovo@example.com']);
    }

    public function test_emails_must_be_unique_including_deactivated_users()
    {
        $deactivated = User::factory()->create();
        $deactivated->delete();

        $response = $this->actingAs($this->userWith('users.create'))
            ->post(route('users.store'), $this->validPayload(['email' => $deactivated->email]));

        $response->assertSessionHasErrors('email');
    }

    public function test_users_can_be_updated_keeping_their_password()
    {
        Role::findOrCreate('admin');
        $target = User::factory()->create()->assignRole(Role::findOrCreate('user'));
        $originalPassword = $target->password;

        $response = $this->actingAs($this->userWith('users.update'))->put(route('users.update', $target), [
            'name' => 'Nome Aggiornato',
            'email' => $target->email,
            'password' => '',
            'password_confirmation' => '',
            'roles' => ['admin'],
        ]);

        $response->assertRedirect(route('users.index'));
        $target->refresh();
        $this->assertSame('Nome Aggiornato', $target->name);
        $this->assertSame($originalPassword, $target->password);
        $this->assertNotNull($target->email_verified_at);
        $this->assertEqualsCanonicalizing(['admin'], $target->getRoleNames()->all());
    }

    public function test_changing_a_users_email_requires_verifying_it_again()
    {
        $target = User::factory()->create();

        $this->actingAs($this->userWith('users.update'))->put(route('users.update', $target), [
            'name' => $target->name,
            'email' => 'nuova-email@example.com',
            'roles' => [],
        ]);

        $target->refresh();
        $this->assertSame('nuova-email@example.com', $target->email);
        $this->assertNull($target->email_verified_at);
    }

    public function test_the_password_changes_when_filled_in()
    {
        $target = User::factory()->create();

        $this->actingAs($this->userWith('users.update'))->put(route('users.update', $target), [
            'name' => $target->name,
            'email' => $target->email,
            'password' => 'brand-new-password',
            'password_confirmation' => 'brand-new-password',
            'roles' => [],
        ]);

        $this->assertTrue(Hash::check('brand-new-password', $target->fresh()?->password ?? ''));
    }

    public function test_users_can_be_deactivated()
    {
        $target = User::factory()->create();

        $response = $this->actingAs($this->userWith('users.delete'))->delete(route('users.destroy', $target));

        $response->assertRedirect(route('users.index'));
        $this->assertSoftDeleted($target);
    }

    public function test_users_cannot_deactivate_themselves()
    {
        $actor = $this->userWith('users.delete');

        $response = $this->actingAs($actor)->delete(route('users.destroy', $actor));

        $response->assertForbidden();
        $this->assertNotSoftDeleted($actor);
    }

    public function test_admins_cannot_deactivate_themselves_either()
    {
        $admin = User::factory()->create()->assignRole(Role::findOrCreate('admin'));

        $response = $this->actingAs($admin)->delete(route('users.destroy', $admin));

        $response->assertForbidden();
        $this->assertNotSoftDeleted($admin);
    }

    public function test_deactivated_users_can_be_restored()
    {
        $target = User::factory()->create();
        $target->delete();

        $response = $this->actingAs($this->userWith('users.delete'))->put(route('users.restore', $target));

        $response->assertRedirect(route('users.index'));
        $this->assertNotSoftDeleted($target);
    }

    public function test_deactivated_users_cannot_log_in()
    {
        $user = User::factory()->create();
        $user->delete();

        $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password']);

        $this->assertGuest();
    }

    public function test_deleting_your_own_account_only_deactivates_it()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->delete(route('profile.destroy'), ['password' => 'password']);

        $response->assertRedirect('/');
        $this->assertSoftDeleted($user);
    }

    public function test_shared_permissions_follow_the_users_abilities()
    {
        Permission::findOrCreate('roles.view');

        $response = $this->actingAs($this->userWith('users.view'))->get(route('dashboard'));

        $response->assertInertia(fn (AssertableInertia $page) => $page->where('auth.permissions', ['users.view']));
    }

    public function test_admins_receive_every_permission()
    {
        foreach (['roles.view', 'users.create', 'users.view'] as $permission) {
            Permission::findOrCreate($permission);
        }
        $admin = User::factory()->create()->assignRole(Role::findOrCreate('admin'));

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('auth.permissions', ['roles.view', 'users.create', 'users.view']));
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validPayload(array $overrides = []): array
    {
        return [
            'name' => 'Nuovo Utente',
            'email' => 'nuovo@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
            'roles' => [],
            ...$overrides,
        ];
    }

    private function userWith(string $permission): User
    {
        return User::factory()->create()->givePermissionTo(Permission::findOrCreate($permission));
    }
}
