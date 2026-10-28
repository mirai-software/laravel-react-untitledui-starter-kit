<?php

namespace App\Http\Requests\Users;

use App\Concerns\ProfileValidationRules;
use App\Concerns\RoleValidationRules;
use App\Models\Role;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

class UpdateUserRequest extends FormRequest
{
    use ProfileValidationRules, RoleValidationRules;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->route('user');

        return $user instanceof User && ($this->user()?->can('update', $user) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     * The password is optional: it only changes when filled in.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->route('user');

        return [
            ...$this->profileRules($user instanceof User ? $user->id : null),
            'password' => ['nullable', 'string', Password::default(), 'confirmed'],
            ...$this->roleRules($this->user()),
        ];
    }

    /**
     * An admin can't remove the admin role from themselves, so the app always keeps an admin.
     * Checked here because Gate::before lets admins skip the policies.
     *
     * @return array<int, Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $user = $this->route('user');
                $roles = (array) $this->input('roles', []);

                if ($user instanceof User
                    && $this->user()?->is($user)
                    && $user->hasRole(Role::ADMIN)
                    && ! in_array(Role::ADMIN, $roles, true)) {
                    $validator->errors()->add('roles', __('Non puoi togliere a te stesso il ruolo di amministratore.'));
                }
            },
        ];
    }
}
