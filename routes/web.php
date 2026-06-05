<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

// Le rotte basate su controller sono dichiarate tramite gli attributi di rotta
// (spatie/laravel-route-attributes) sui rispettivi controller in app/Http/Controllers.
// Qui restano solo le rotte "inertia-only" prive di controller.

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__ . '/settings.php';
