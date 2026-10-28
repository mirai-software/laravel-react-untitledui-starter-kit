<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

/**
 * The roles and permissions the app needs. Safe to run again: it only adds what is missing,
 * so it runs on every deploy (`php artisan migrate --seed --force`). A project adds its own
 * permissions to PERMISSIONS.
 */
class RolePermissionSeeder extends Seeder
{
    /**
     * The permissions, named `resource.action`.
     *
     * @var list<string>
     */
    public const array PERMISSIONS = [
        'roles.view',
        'roles.create',
        'roles.update',
        'roles.delete',
        'users.view',
        'users.create',
        'users.update',
        'users.delete',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // The admin role passes every check through Gate::before, so it needs no permissions.
        Role::findOrCreate(Role::ADMIN, 'web');
        Role::findOrCreate(Role::USER, 'web');
    }
}
