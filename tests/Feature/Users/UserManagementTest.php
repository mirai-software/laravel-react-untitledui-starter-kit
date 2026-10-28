<?php

namespace Tests\Feature\Users;

use App\Models\Passkey;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia;
use Laravel\Fortify\Features;
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

    public function test_non_admins_cannot_manage_users_with_more_permissions()
    {
        $actor = $this->userWith('users.view');
        foreach (['users.update', 'users.delete'] as $permission) {
            $actor->givePermissionTo(Permission::findOrCreate($permission));
        }
        $manager = User::factory()->create()->assignRole(
            Role::findOrCreate('manager')->givePermissionTo(Permission::findOrCreate('roles.update')),
        );
        $peer = $this->userWith('users.view');

        $this->actingAs($actor)->get(route('users.index'))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('users', fn ($users) => collect($users)->contains(
                fn (array $user) => $user['id'] === $manager->id && $user['can'] === ['update' => false, 'delete' => false, 'restore' => false],
            ) && collect($users)->contains(
                fn (array $user) => $user['id'] === $peer->id && $user['can'] === ['update' => true, 'delete' => true, 'restore' => false],
            )));
        $this->actingAs($actor)->get(route('users.edit', $manager))->assertForbidden();
        $this->actingAs($actor)->put(route('users.update', $manager), [
            'name' => $manager->name,
            'email' => $manager->email,
            'password' => 'presa-password',
            'password_confirmation' => 'presa-password',
        ])->assertForbidden();
        $this->actingAs($actor)->delete(route('users.destroy', $manager))->assertForbidden();

        $this->assertTrue(Hash::check('password', $manager->fresh()?->password ?? ''));
        $this->assertNotSoftDeleted($manager);
    }

    public function test_admins_create_users_with_the_roles_they_choose()
    {
        Notification::fake();
        Role::findOrCreate('editor');

        $response = $this->actingAs($this->admin())
            ->post(route('users.store'), $this->validPayload(['roles' => ['editor']]));

        $response->assertRedirect(route('users.index'));
        $created = User::where('email', 'nuovo@example.com')->firstOrFail();
        $this->assertSame('Nuovo Utente', $created->name);
        $this->assertTrue($created->hasRole('editor'));
        $this->assertTrue(Hash::check('secret-password', $created->password));
        Notification::assertSentTo($created, VerifyEmail::class);
    }

    public function test_a_failing_verification_email_keeps_the_new_user_and_warns()
    {
        config(['mail.default' => 'rotto', 'mail.mailers.rotto' => ['transport' => 'inesistente']]);

        $response = $this->actingAs($this->admin())->post(route('users.store'), $this->validPayload());

        $response->assertRedirect(route('users.index'));
        $response->assertInertiaFlash('toast.type', 'warning');
        $this->assertDatabaseHas('users', ['email' => 'nuovo@example.com']);
    }

    public function test_no_verification_email_is_sent_when_the_app_does_not_verify_emails()
    {
        Notification::fake();
        config(['fortify.features' => array_values(array_filter(
            config('fortify.features'),
            fn (string $feature): bool => $feature !== Features::emailVerification(),
        ))]);

        $response = $this->actingAs($this->admin())->post(route('users.store'), $this->validPayload());

        $response->assertRedirect(route('users.index'));
        $response->assertInertiaFlash('toast.type', 'success');
        Notification::assertNothingSent();
    }

    public function test_users_created_by_non_admins_get_the_user_role()
    {
        $response = $this->actingAs($this->userWith('users.create'))
            ->post(route('users.store'), $this->validPayload());

        $response->assertRedirect(route('users.index'));
        $this->assertEqualsCanonicalizing(
            [Role::USER],
            User::where('email', 'nuovo@example.com')->firstOrFail()->getRoleNames()->all(),
        );
    }

    public function test_only_admins_can_assign_roles()
    {
        Role::findOrCreate('editor');
        $actor = $this->userWith('users.create');
        $actor->givePermissionTo(Permission::findOrCreate('users.update'));

        $this->actingAs($actor)->get(route('users.create'))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('canAssignRoles', false)
            ->where('roles', []));
        $this->actingAs($actor)
            ->post(route('users.store'), $this->validPayload(['roles' => ['editor']]))
            ->assertSessionHasErrors('roles');
        $this->actingAs($actor)->put(route('users.update', $actor), [
            'name' => $actor->name,
            'email' => $actor->email,
            'roles' => ['editor'],
        ])->assertSessionHasErrors('roles');

        $this->assertDatabaseMissing('users', ['email' => 'nuovo@example.com']);
        $this->assertFalse($actor->fresh()?->hasRole('editor'));

        $this->actingAs($this->admin())
            ->post(route('users.store'), $this->validPayload(['roles' => [Role::ADMIN]]))
            ->assertRedirect(route('users.index'));
        $this->assertTrue(User::where('email', 'nuovo@example.com')->firstOrFail()->hasRole(Role::ADMIN));
    }

    public function test_admins_must_send_the_roles_when_updating_a_user()
    {
        $target = User::factory()->create()->assignRole(Role::findOrCreate(Role::USER));

        $response = $this->actingAs($this->admin())->put(route('users.update', $target), [
            'name' => $target->name,
            'email' => $target->email,
        ]);

        $response->assertSessionHasErrors('roles');
        $this->assertTrue($target->fresh()?->hasRole(Role::USER));
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

    public function test_users_can_be_updated_keeping_their_password_and_roles()
    {
        Notification::fake();
        $target = User::factory()->create()->assignRole(Role::findOrCreate(Role::USER));
        $originalPassword = $target->password;

        $response = $this->actingAs($this->userWith('users.update'))->put(route('users.update', $target), [
            'name' => 'Nome Aggiornato',
            'email' => $target->email,
            'password' => '',
            'password_confirmation' => '',
        ]);

        $response->assertRedirect(route('users.index'));
        $target->refresh();
        $this->assertSame('Nome Aggiornato', $target->name);
        $this->assertSame($originalPassword, $target->password);
        $this->assertNotNull($target->email_verified_at);
        $this->assertEqualsCanonicalizing([Role::USER], $target->getRoleNames()->all());
        Notification::assertNothingSent();
    }

    public function test_changing_a_users_email_requires_verifying_it_again()
    {
        Notification::fake();
        $target = User::factory()->create();

        $this->actingAs($this->userWith('users.update'))->put(route('users.update', $target), [
            'name' => $target->name,
            'email' => 'nuova-email@example.com',
            'roles' => [],
        ]);

        $target->refresh();
        $this->assertSame('nuova-email@example.com', $target->email);
        $this->assertNull($target->email_verified_at);
        Notification::assertSentTo($target, VerifyEmail::class);
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

    public function test_the_shared_user_carries_no_roles_or_permissions()
    {
        $response = $this->actingAs($this->userWith('users.view'))->get(route('users.index'));

        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->missing('auth.user.roles')
            ->missing('auth.user.permissions'));
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
