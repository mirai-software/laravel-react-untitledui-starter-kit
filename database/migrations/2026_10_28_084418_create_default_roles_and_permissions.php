<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\PermissionRegistrar;

/**
 * The kit's roles and permissions are data the app needs to work, so a migration creates them
 * in every environment (local, CI, production). Projects add their own permissions in new migrations.
 */
return new class extends Migration
{
    /**
     * The kit's permissions, named `resource.action`.
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

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // The admin role passes every check through Gate::before, so it needs no permissions.
        Role::findOrCreate(Role::ADMIN, 'web');
        Role::findOrCreate(Role::USER, 'web');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Role::query()->whereIn('name', [Role::ADMIN, Role::USER])->delete();
        Permission::query()->whereIn('name', self::PERMISSIONS)->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
