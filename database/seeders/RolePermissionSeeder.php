<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Permessi base del core, raggruppati per risorsa (`risorsa.azione`).
     *
     * @var list<string>
     */
    private const array PERMISSIONS = [
        'roles.view',
        'roles.create',
        'roles.update',
        'roles.delete',
        'users.view',
        'users.create',
        'users.update',
        'users.delete',
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // super-admin: bypassa ogni check via Gate::before (vedi AppServiceProvider),
        // quindi non ha bisogno di permessi espliciti.
        Role::findOrCreate('super-admin', 'web');

        Role::findOrCreate('admin', 'web')->syncPermissions(self::PERMISSIONS);

        Role::findOrCreate('user', 'web');
    }
}
