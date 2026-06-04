<?php

declare(strict_types=1);

namespace Tests\Feature\Users;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class UserRoleAssignmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_without_permission_cannot_list_users(): void
    {
        $this->actingAs(User::factory()->create())
            ->get(route('users.index'))
            ->assertForbidden();
    }

    public function test_user_with_permission_sees_users_index(): void
    {
        $this->actingAs($this->userWith('users.view'))
            ->get(route('users.index'))
            ->assertOk()
            ->assertInertia(
                fn (AssertableInertia $page): AssertableInertia => $page
                    ->component('users/index')
                    ->has('users'),
            );
    }

    public function test_user_with_permission_can_sync_roles(): void
    {
        Role::findOrCreate('admin');
        Role::findOrCreate('user');

        $target = User::factory()->create();
        $target->assignRole('user');

        $this->actingAs($this->userWith('users.update'))
            ->put(route('users.roles.update', $target), [
                'roles' => ['admin'],
            ])
            ->assertRedirect(route('users.index'));

        $this->assertEqualsCanonicalizing(
            ['admin'],
            $target->fresh()->getRoleNames()->all(),
        );
    }

    public function test_user_without_permission_cannot_sync_roles(): void
    {
        Role::findOrCreate('admin');
        $target = User::factory()->create();

        $this->actingAs(User::factory()->create())
            ->put(route('users.roles.update', $target), ['roles' => ['admin']])
            ->assertForbidden();

        $this->assertCount(0, $target->fresh()->getRoleNames());
    }

    public function test_super_admin_can_assign_roles(): void
    {
        Role::findOrCreate('admin');
        $admin = User::factory()->create();
        $admin->assignRole(Role::findOrCreate('super-admin'));

        $target = User::factory()->create();

        $this->actingAs($admin)
            ->put(route('users.roles.update', $target), ['roles' => ['admin']])
            ->assertRedirect(route('users.index'));

        $this->assertTrue($target->fresh()->hasRole('admin'));
    }

    private function userWith(string $permission): User
    {
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate($permission));

        return $user;
    }
}
