<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Features;
use Tests\TestCase;

class FirstUserIsAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::registration());
    }

    public function test_the_first_registered_user_becomes_admin()
    {
        $this->register('primo@example.com');

        $user = User::where('email', 'primo@example.com')->firstOrFail();
        $this->assertTrue($user->hasRole('admin'));
        $this->assertTrue($user->can('users.create'));
    }

    public function test_later_users_register_as_regular_users()
    {
        User::factory()->create();

        $this->register('secondo@example.com');

        $user = User::where('email', 'secondo@example.com')->firstOrFail();
        $this->assertTrue($user->hasRole('user'));
        $this->assertFalse($user->hasRole('admin'));
        $this->assertFalse($user->can('users.view'));
    }

    public function test_deactivated_users_still_count_as_existing_users()
    {
        User::factory()->create()->delete();

        $this->register('nuovo@example.com');

        $this->assertFalse(User::where('email', 'nuovo@example.com')->firstOrFail()->hasRole('admin'));
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
