<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_a_verified_admin()
    {
        $this->artisan('app:create-admin', ['--email' => 'capo@example.com', '--name' => 'Capo'])
            ->expectsQuestion('Password', 'una-password-sicura')
            ->expectsQuestion('Conferma la password', 'una-password-sicura')
            ->assertSuccessful();

        $admin = User::where('email', 'capo@example.com')->firstOrFail();
        $this->assertSame('Capo', $admin->name);
        $this->assertTrue($admin->hasRole(Role::ADMIN));
        $this->assertTrue($admin->hasVerifiedEmail());
        $this->assertTrue(Hash::check('una-password-sicura', $admin->password));
    }

    public function test_it_asks_for_the_missing_details()
    {
        $this->artisan('app:create-admin')
            ->expectsQuestion('Email', 'capo@example.com')
            ->expectsQuestion('Nome', 'Capo')
            ->expectsQuestion('Password', 'una-password-sicura')
            ->expectsQuestion('Conferma la password', 'una-password-sicura')
            ->assertSuccessful();

        $this->assertTrue(User::where('email', 'capo@example.com')->firstOrFail()->hasRole(Role::ADMIN));
    }

    public function test_it_rejects_invalid_details()
    {
        $this->artisan('app:create-admin', ['--email' => 'non-una-email', '--name' => 'Capo'])
            ->expectsQuestion('Password', 'una-password-sicura')
            ->expectsQuestion('Conferma la password', 'una-password-diversa')
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_it_makes_an_existing_user_admin_after_confirming()
    {
        $user = User::factory()->create();

        $this->artisan('app:create-admin', ['--email' => $user->email])
            ->expectsConfirmation("Esiste già {$user->name} ({$user->email}). Vuoi renderlo amministratore?", 'yes')
            ->assertSuccessful();

        $this->assertTrue($user->fresh()?->hasRole(Role::ADMIN));
    }

    public function test_it_changes_nothing_without_confirmation()
    {
        $user = User::factory()->create();

        $this->artisan('app:create-admin', ['--email' => $user->email])
            ->expectsConfirmation("Esiste già {$user->name} ({$user->email}). Vuoi renderlo amministratore?", 'no')
            ->assertFailed();

        $this->assertFalse($user->fresh()?->hasRole(Role::ADMIN));
    }

    public function test_it_reactivates_a_deactivated_user_it_makes_admin()
    {
        $user = User::factory()->create();
        $user->delete();

        $this->artisan('app:create-admin', ['--email' => $user->email])
            ->expectsConfirmation("{$user->name} ({$user->email}) è disattivato. Vuoi riattivarlo e renderlo amministratore?", 'yes')
            ->assertSuccessful();

        $this->assertNotSoftDeleted($user);
        $this->assertTrue($user->fresh()?->hasRole(Role::ADMIN));
    }
}
