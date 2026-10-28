<?php

namespace App\Concerns;

use App\Models\Role;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait RoleValidationRules
{
    /**
     * Get the validation rules for the roles assigned in the user form.
     * Only an admin can assign the admin role.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function roleRules(?User $actor): array
    {
        $itemRules = ['string', Rule::exists('roles', 'name')];

        if (! $actor?->hasRole(Role::ADMIN)) {
            $itemRules[] = Rule::notIn([Role::ADMIN]);
        }

        return [
            'roles' => ['array'],
            'roles.*' => $itemRules,
        ];
    }
}
