<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * The core permissions, named `resource.action`.
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
     * Create the core permissions and the `admin` and `user` roles.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // `admin` already passes every check through Gate::before (AppServiceProvider);
        // its permissions are kept in sync anyway, so the roles page shows them.
        Role::findOrCreate('admin', 'web')->syncPermissions(self::PERMISSIONS);

        Role::findOrCreate('user', 'web');
    }
}
