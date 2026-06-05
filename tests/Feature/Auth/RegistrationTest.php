<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post(route('register.store'), [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    public function test_first_registered_user_becomes_admin(): void
    {
        $this->post(route('register.store'), [
            'name'                  => 'Primo Utente',
            'email'                 => 'primo@example.com',
            'password'              => 'password',
            'password_confirmation' => 'password',
        ]);

        $user = User::query()->where('email', 'primo@example.com')->firstOrFail();

        $this->assertTrue($user->hasRole('admin'));
        // L'admin bypassa ogni check via Gate::before.
        $this->assertTrue($user->can('users.create'));
    }

    public function test_subsequent_users_register_as_regular_users(): void
    {
        User::factory()->create();

        $this->post(route('register.store'), [
            'name'                  => 'Secondo Utente',
            'email'                 => 'secondo@example.com',
            'password'              => 'password',
            'password_confirmation' => 'password',
        ]);

        $user = User::query()->where('email', 'secondo@example.com')->firstOrFail();

        $this->assertTrue($user->hasRole('user'));
        $this->assertFalse($user->hasRole('admin'));
        $this->assertCount(0, $user->getAllPermissions());
    }
}
