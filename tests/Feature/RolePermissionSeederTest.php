<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_the_roles_and_permissions_and_can_run_again()
    {
        $this->seed(RolePermissionSeeder::class);
        $this->seed(RolePermissionSeeder::class);

        $this->assertEqualsCanonicalizing(RolePermissionSeeder::PERMISSIONS, Permission::query()->pluck('name')->all());
        $this->assertEqualsCanonicalizing([Role::ADMIN, Role::USER], Role::query()->pluck('name')->all());
    }

    public function test_the_database_seeder_is_safe_in_production()
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(count(RolePermissionSeeder::PERMISSIONS), Permission::query()->count());
        $this->assertSame(0, User::query()->count());
    }
}
