<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Support\Facades\Route;
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

    public function test_an_english_default_message_falls_back_to_the_pages_generic_text()
    {
        $response = $this->actingAs(User::factory()->create())->get(route('roles.index'));

        $response->assertForbidden()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('error')
            ->where('message', null),
        );
    }

    public function test_a_page_refused_with_an_explanation_shows_it()
    {
        $response = $this->actingAs($this->admin())->get(route('roles.edit', Role::findOrCreate(Role::ADMIN)));

        $response->assertForbidden()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('error')
            ->where('message', 'Il ruolo di amministratore ha sempre tutti i permessi e non si modifica.'),
        );
    }

    public function test_an_action_refused_from_a_list_goes_back_to_it_with_the_explanation()
    {
        $list = route('roles.index', ['filter' => ['search' => 'adm']]);

        $response = $this->actingAs($this->admin())->from($list)->withHeader('X-Inertia', 'true')
            ->delete(route('roles.destroy', Role::findOrCreate(Role::ADMIN)));

        $response->assertRedirect($list);
        $response->assertInertiaFlash('toast.type', 'error');
        $response->assertInertiaFlash('toast.message', 'Questo ruolo è protetto e non può essere eliminato.');
    }

    public function test_an_action_refused_without_an_explanation_goes_back_with_the_generic_one()
    {
        $edit = route('roles.edit', Role::findOrCreate(Role::ADMIN));

        $response = $this->actingAs($this->admin())->from($edit)->withHeader('X-Inertia', 'true')
            ->put(route('roles.update', Role::findOrCreate(Role::ADMIN)), ['name' => Role::ADMIN]);

        $response->assertRedirect($edit);
        $response->assertInertiaFlash('toast.message', 'Non hai i permessi per questa azione.');
    }

    public function test_a_request_too_large_for_the_server_renders_the_error_page()
    {
        $response = $this->call('POST', route('login.store'), server: ['CONTENT_LENGTH' => (string) (1024 ** 3)]);

        $response->assertStatus(413)->assertInertia(fn (AssertableInertia $page) => $page
            ->component('error')
            ->where('status', 413),
        );
    }

    public function test_a_method_the_address_does_not_accept_renders_the_error_page()
    {
        $response = $this->get(route('logout'));

        $response->assertMethodNotAllowed()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('error')
            ->where('status', 405),
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

    public function test_json_requests_keep_laravels_json_errors()
    {
        $response = $this->actingAs(User::factory()->create())->getJson(route('roles.index'));

        $response->assertForbidden()->assertJsonStructure(['message']);
    }

    public function test_an_expired_page_goes_back_with_a_toast_instead_of_an_error_page()
    {
        Route::middleware('web')->post('/_test/expired', fn () => throw new TokenMismatchException);

        $response = $this->from(route('login'))->post('/_test/expired');

        $response->assertRedirect(route('login'));
        $response->assertInertiaFlash('toast.type', 'error');
    }

    public function test_debug_mode_keeps_laravels_error_page()
    {
        config(['app.debug' => true]);

        $response = $this->get('/questa-pagina-non-esiste');

        $response->assertNotFound();
        $this->assertStringNotContainsString('"component":"error"', (string) $response->getContent());
    }

    private function admin(): User
    {
        return User::factory()->create()->assignRole(Role::findOrCreate(Role::ADMIN));
    }
}
