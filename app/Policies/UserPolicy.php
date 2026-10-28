<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view the users list.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('users.view');
    }

    /**
     * Determine whether the user can create users.
     */
    public function create(User $user): bool
    {
        return $user->can('users.create');
    }

    /**
     * Determine whether the user can update the given user.
     * Only admins (through Gate::before) can edit an admin.
     */
    public function update(User $user, User $model): bool
    {
        return $user->can('users.update') && ! $model->hasRole(Role::ADMIN);
    }

    /**
     * Determine whether the user can deactivate (soft delete) the given user.
     * Nobody can deactivate themselves from here; that's "Elimina account" in the settings.
     * Only admins (through Gate::before) can deactivate an admin.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->can('users.delete') && $user->isNot($model) && ! $model->hasRole(Role::ADMIN);
    }

    /**
     * Determine whether the user can restore a deactivated user.
     * Only admins (through Gate::before) can restore an admin.
     */
    public function restore(User $user, User $model): bool
    {
        return $user->can('users.delete') && ! $model->hasRole(Role::ADMIN);
    }
}
