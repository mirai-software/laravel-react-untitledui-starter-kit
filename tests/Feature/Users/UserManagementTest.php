<?php

namespace Tests\Feature\Users;

use App\Models\Passkey;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia;
use Laravel\Passkeys\Passkeys;
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

    public function test_non_admins_cannot_manage_admins()
    {
        $admin = $this->admin();
        $actor = $this->userWith('users.view');
        foreach (['users.update', 'users.delete'] as $permission) {
            $actor->givePermissionTo(Permission::findOrCreate($permission));
        }

        $this->actingAs($actor)->get(route('users.index'))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users', fn ($users) => collect($users)->contains(
                fn (array $user) => $user['id'] === $admin->id && $user['can'] === ['update' => false, 'delete' => false, 'restore' => false],
            )));
        $this->actingAs($actor)->get(route('users.edit', $admin))->assertForbidden();
        $this->actingAs($actor)->put(route('users.update', $admin), [
            'name' => $admin->name,
            'email' => 'presa@example.com',
            'roles' => [],
        ])->assertForbidden();
        $this->actingAs($actor)->delete(route('users.destroy', $admin))->assertForbidden();

        $admin->delete();
        $this->actingAs($actor)->put(route('users.restore', $admin))->assertForbidden();

        $this->assertSame($admin->email, $admin->fresh()?->email);
    }

    public function test_users_can_be_created_with_roles()
    {
        Role::findOrCreate('editor');

        $response = $this->actingAs($this->userWith('users.create'))
            ->post(route('users.store'), $this->validPayload(['roles' => ['editor']]));

        $response->assertRedirect(route('users.index'));
        $created = User::where('email', 'nuovo@example.com')->firstOrFail();
        $this->assertSame('Nuovo Utente', $created->name);
        $this->assertTrue($created->hasRole('editor'));
        $this->assertTrue(Hash::check('secret-password', $created->password));
    }

    public function test_only_admins_can_assign_the_admin_role()
    {
        $actor = $this->userWith('users.create');
        $actor->givePermissionTo(Permission::findOrCreate('users.update'));

        $this->actingAs($actor)->get(route('users.create'))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('roles', fn ($roles) => ! collect($roles)->contains(Role::ADMIN)));
        $this->actingAs($actor)
            ->post(route('users.store'), $this->validPayload(['roles' => [Role::ADMIN]]))
            ->assertSessionHasErrors('roles.0');
        $this->actingAs($actor)->put(route('users.update', $actor), [
            'name' => $actor->name,
            'email' => $actor->email,
            'roles' => [Role::ADMIN],
        ])->assertSessionHasErrors('roles.0');

        $this->assertDatabaseMissing('users', ['email' => 'nuovo@example.com']);
        $this->assertFalse($actor->fresh()?->hasRole(Role::ADMIN));

        $this->actingAs($this->admin())
            ->post(route('users.store'), $this->validPayload(['roles' => [Role::ADMIN]]))
            ->assertRedirect(route('users.index'));
        $this->assertTrue(User::where('email', 'nuovo@example.com')->firstOrFail()->hasRole(Role::ADMIN));
    }

    public function test_admins_cannot_remove_the_admin_role_from_themselves()
    {
        $admin = $this->admin();

        $this->actingAs($admin)->get(route('users.edit', $admin))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('lockedRoles', [Role::ADMIN]));

        $response = $this->actingAs($admin)->put(route('users.update', $admin), [
            'name' => $admin->name,
            'email' => $admin->email,
            'roles' => [],
        ]);

        $response->assertSessionHasErrors('roles');
        $this->assertTrue($admin->fresh()?->hasRole(Role::ADMIN));
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
        Role::findOrCreate('editor');
        $target = User::factory()->create()->assignRole(Role::findOrCreate(Role::USER));
        $originalPassword = $target->password;

        $response = $this->actingAs($this->userWith('users.update'))->put(route('users.update', $target), [
            'name' => 'Nome Aggiornato',
            'email' => $target->email,
            'password' => '',
            'password_confirmation' => '',
            'roles' => ['editor'],
        ]);

        $response->assertRedirect(route('users.index'));
        $target->refresh();
        $this->assertSame('Nome Aggiornato', $target->name);
        $this->assertSame($originalPassword, $target->password);
        $this->assertNotNull($target->email_verified_at);
        $this->assertEqualsCanonicalizing(['editor'], $target->getRoleNames()->all());
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
        $admin = $this->admin();

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

    public function test_deactivated_users_cannot_log_in_with_a_passkey()
    {
        $user = User::factory()->create();
        $user->passkeys()->create(['name' => 'Portatile', 'credential_id' => 'credenziale-di-prova', 'credential' => []]);
        $user->delete();

        // A full WebAuthn sign-in needs a real authenticator: check the two steps that decide it.
        $passkey = Passkey::where('credential_id', 'credenziale-di-prova')->firstOrFail();

        $this->assertTrue($passkey->user?->is($user));
        $this->assertFalse(Passkeys::allowsLogin(request(), $passkey));

        $user->restore();
        $this->assertTrue(Passkeys::allowsLogin(request(), $passkey->refresh()));
    }

    public function test_the_last_admin_cannot_delete_their_account()
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)->delete(route('profile.destroy'), ['password' => 'password']);

        $response->assertSessionHasErrors('password');
        $this->assertNotSoftDeleted($admin);
        $this->assertAuthenticatedAs($admin);
    }

    public function test_an_admin_can_delete_their_account_when_another_admin_remains()
    {
        $admin = $this->admin();
        $this->admin();

        $response = $this->actingAs($admin)->delete(route('profile.destroy'), ['password' => 'password']);

        $response->assertRedirect('/');
        $this->assertSoftDeleted($admin);
    }

    public function test_shared_permissions_follow_the_users_abilities()
    {
        Permission::findOrCreate('roles.view');

        $response = $this->actingAs($this->userWith('users.view'))->get(route('dashboard'));

        $response->assertInertia(fn (AssertableInertia $page) => $page->where('auth.permissions', ['users.view']));
    }

    public function test_admins_receive_every_permission()
    {
        Permission::findOrCreate('reports.view');

        $response = $this->actingAs($this->admin())->get(route('dashboard'));

        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->where('auth.permissions', Permission::query()->orderBy('name')->pluck('name')->all())
            ->where('auth.permissions', fn ($permissions) => collect($permissions)->contains('reports.view')));
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

    private function admin(): User
    {
        return User::factory()->create()->assignRole(Role::findOrCreate(Role::ADMIN));
    }
}
