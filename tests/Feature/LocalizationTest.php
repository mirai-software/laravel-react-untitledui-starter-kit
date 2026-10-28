<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Fortify\Features;
use Tests\TestCase;

class LocalizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->app->setLocale('it');
    }

    public function test_validation_errors_are_in_italian()
    {
        $this->skipUnlessFortifyHas(Features::registration());

        $response = $this->post(route('register.store'), [
            'name' => 'Mario Rossi',
            'email' => 'mario@example.com',
            'password' => 'password',
            'password_confirmation' => 'altra-password',
        ]);

        $response->assertSessionHasErrors([
            'password' => 'Il campo di conferma per password non coincide.',
        ]);
    }

    public function test_failed_login_message_is_in_italian()
    {
        $user = User::factory()->create();

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors([
            'email' => 'Credenziali non valide.',
        ]);
    }

    public function test_upstream_toast_messages_have_italian_translations()
    {
        $this->assertSame('Profilo aggiornato.', __('Profile updated.'));
        $this->assertSame('Password aggiornata.', __('Password updated.'));
    }
}
