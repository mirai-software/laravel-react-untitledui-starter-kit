<?php

namespace App\Policies;

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
     * Determine whether the user can view the given user.
     */
    public function view(User $user, User $model): bool
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
     */
    public function update(User $user, User $model): bool
    {
        return $user->can('users.update');
    }

    /**
     * Determine whether the user can deactivate (soft delete) the given user.
     * Nobody can deactivate themselves from here; that's "Elimina account" in the settings.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->can('users.delete') && $user->isNot($model);
    }

    /**
     * Determine whether the user can restore a deactivated user.
     */
    public function restore(User $user, User $model): bool
    {
        return $user->can('users.delete');
    }
}
