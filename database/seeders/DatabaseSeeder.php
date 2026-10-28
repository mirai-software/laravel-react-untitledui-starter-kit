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
     * Roles and permissions come from the migrations. No users here: admins are created with
     * `php artisan app:create-admin`, test data with factories.
     */
    public function run(): void
    {
        // User::factory(10)->create();
    }
}
