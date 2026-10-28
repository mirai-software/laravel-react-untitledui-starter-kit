<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

/**
 * Admins pass every check through Gate::before. Anyone else can only manage users who are
 * not admins and have no permission they lack themselves, so managing users can't be used
 * to take over a more powerful account.
 */
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
     */
    public function update(User $user, User $model): bool
    {
        return $user->can('users.update') && $this->isWithinReach($user, $model);
    }

    /**
     * Determine whether the user can deactivate (soft delete) the given user.
     * Nobody can deactivate themselves from here; that's "Elimina account" in the settings.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->can('users.delete') && $user->isNot($model) && $this->isWithinReach($user, $model);
    }

    /**
     * Determine whether the user can restore a deactivated user.
     */
    public function restore(User $user, User $model): bool
    {
        return $user->can('users.delete') && $this->isWithinReach($user, $model);
    }

    /**
     * Whether the target is not an admin and has no permission the user lacks.
     */
    private function isWithinReach(User $user, User $model): bool
    {
        if ($model->hasRole(Role::ADMIN)) {
            return false;
        }

        return $model->getAllPermissions()->pluck('name')
            ->diff($user->getAllPermissions()->pluck('name'))
            ->isEmpty();
    }
}
