<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ErrorPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['app.debug' => false]);
    }

    public function test_forbidden_pages_render_the_error_page()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('roles.index'));

        $response->assertForbidden()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('error')
            ->where('status', 403)
            ->where('auth.user.id', $user->id),
        );
    }

    public function test_missing_pages_render_the_error_page()
    {
        $response = $this->get('/questa-pagina-non-esiste');

        $response->assertNotFound()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('error')
            ->where('status', 404),
        );
    }

    public function test_debug_mode_keeps_laravels_error_page()
    {
        config(['app.debug' => true]);

        $response = $this->get('/questa-pagina-non-esiste');

        $response->assertNotFound();
        $this->assertStringNotContainsString('"component":"error"', (string) $response->getContent());
    }
}
