<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DefaultRolesAndPermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_migrations_create_the_kits_roles_and_permissions()
    {
        $this->assertEqualsCanonicalizing([
            'roles.view',
            'roles.create',
            'roles.update',
            'roles.delete',
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
        ], Permission::query()->pluck('name')->all());
        $this->assertEqualsCanonicalizing([Role::ADMIN, Role::USER], Role::query()->pluck('name')->all());
    }
}
