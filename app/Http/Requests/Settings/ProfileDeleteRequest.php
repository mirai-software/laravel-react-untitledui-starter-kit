<?php

namespace App\Http\Requests\Settings;

use App\Concerns\PasswordValidationRules;
use App\Models\Role;
use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ProfileDeleteRequest extends FormRequest
{
    use PasswordValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'password' => $this->currentPasswordRules(),
        ];
    }

    /**
     * The last active admin can't delete their account, so the app always keeps an admin.
     *
     * @return array<int, Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $user = $this->user();

                if ($user instanceof User
                    && $user->hasRole(Role::ADMIN)
                    && User::role(Role::ADMIN)->count() === 1) {
                    $validator->errors()->add('password', __('Sei l\'unico amministratore: assegna il ruolo di amministratore a un altro utente prima di eliminare il tuo account.'));
                }
            },
        ];
    }
}
