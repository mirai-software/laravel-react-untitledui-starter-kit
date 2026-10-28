<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Safe in production: it only adds the roles and permissions the app needs, so deploys run
     * `php artisan migrate --seed --force`. No users here: admins are created with
     * `php artisan app:create-admin`, test data with factories.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        // User::factory(10)->create();
    }
}
