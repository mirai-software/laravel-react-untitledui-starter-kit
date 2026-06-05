<?php

declare(strict_types=1);

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        // Il primo utente registrato diventa admin (bootstrap dell'istanza);
        // i successivi sono utenti normali. `withTrashed()` evita che, dopo
        // aver disattivato tutti gli account, una nuova registrazione torni
        // ad ottenere privilegi di admin.
        $isFirstUser = User::withTrashed()->doesntExist();

        $user = User::query()->create([
            'name'     => $input['name'],
            'email'    => $input['email'],
            'password' => $input['password'],
        ]);

        $user->assignRole(Role::findOrCreate($isFirstUser ? 'admin' : 'user', 'web'));

        return $user;
    }
}
