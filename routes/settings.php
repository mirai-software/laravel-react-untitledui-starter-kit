<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

// ProfileController e SecurityController dichiarano le proprie rotte tramite
// gli attributi di rotta (spatie/laravel-route-attributes). Qui restano solo
// il redirect e la rotta inertia-only senza controller.

Route::middleware(['auth'])->group(function (): void {
    Route::redirect('settings', '/settings/profile');
});

Route::middleware(['auth', 'verified'])->group(function (): void {
    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});
