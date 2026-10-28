<?php

namespace App\Concerns;

use App\Models\Role;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait RoleValidationRules
{
    /**
     * Get the validation rules for the roles in the user form.
     * Only an admin assigns roles: for anyone else the field must be missing or empty.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function roleRules(?User $actor): array
    {
        if (! $actor?->hasRole(Role::ADMIN)) {
            return [
                'roles' => ['prohibited'],
            ];
        }

        return [
            'roles' => ['present', 'array'],
            'roles.*' => ['string', Rule::exists('roles', 'name')],
        ];
    }
}
