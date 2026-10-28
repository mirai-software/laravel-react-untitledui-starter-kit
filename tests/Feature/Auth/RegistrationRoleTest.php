<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Laravel\Fortify\Features;
use Tests\TestCase;

class RegistrationRoleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::registration());
    }

    public function test_registering_never_makes_an_admin_not_even_the_first_user()
    {
        $this->register('primo@example.com');

        $user = User::where('email', 'primo@example.com')->firstOrFail();
        $this->assertEqualsCanonicalizing([Role::USER], $user->getRoleNames()->all());
        $this->assertFalse($user->can('users.view'));
    }

    public function test_registered_users_get_no_permissions_from_the_default_role()
    {
        $this->register('utente@example.com');

        $user = User::where('email', 'utente@example.com')->firstOrFail();
        $user->markEmailAsVerified();

        $this->actingAs($user)->get(route('dashboard'))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('auth.permissions', []));
    }

    private function register(string $email): void
    {
        $this->post(route('register.store'), [
            'name' => 'Utente',
            'email' => $email,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);
    }
}
