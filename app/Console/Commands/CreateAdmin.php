<?php

namespace App\Console\Commands;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

/**
 * The way to get an admin: registering never makes one. It creates a new admin (already verified),
 * or makes an existing user admin, reactivating them if they were deactivated.
 */
#[Signature('app:create-admin {--email= : L\'email dell\'amministratore} {--name= : Il nome, se l\'utente è nuovo}')]
#[Description('Crea un amministratore, o rende amministratore un utente esistente')]
class CreateAdmin extends Command
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->stringOption('email') ?? text(label: 'Email', required: true);

        $existing = User::withTrashed()->where('email', $email)->first();

        return $existing === null
            ? $this->createAdmin($email)
            : $this->promote($existing);
    }

    /**
     * Create a new, already verified admin.
     */
    private function createAdmin(string $email): int
    {
        $input = [
            'name' => $this->stringOption('name') ?? text(label: 'Nome', required: true),
            'email' => $email,
            'password' => password(label: 'Password', required: true),
            'password_confirmation' => password(label: 'Conferma la password', required: true),
        ];

        $validator = Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->components->error($error);
            }

            return self::FAILURE;
        }

        DB::transaction(function () use ($input): void {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
            ]);

            $user->markEmailAsVerified();
            $user->assignRole(Role::ADMIN);
        });

        $this->components->info("Amministratore creato: {$email}");

        return self::SUCCESS;
    }

    /**
     * Make an existing user admin, reactivating them if they were deactivated.
     */
    private function promote(User $user): int
    {
        if (! $user->trashed() && $user->hasRole(Role::ADMIN)) {
            $this->components->info("{$user->email} è già amministratore.");

            return self::SUCCESS;
        }

        $question = $user->trashed()
            ? "{$user->name} ({$user->email}) è disattivato. Vuoi riattivarlo e renderlo amministratore?"
            : "Esiste già {$user->name} ({$user->email}). Vuoi renderlo amministratore?";

        if (! confirm(label: $question, default: false)) {
            $this->components->warn('Nessuna modifica.');

            return self::FAILURE;
        }

        if ($user->trashed()) {
            $user->restore();
        }

        $user->assignRole(Role::ADMIN);

        $this->components->info("{$user->email} ora è amministratore.");

        return self::SUCCESS;
    }

    /**
     * A non-empty string option, or null.
     */
    private function stringOption(string $name): ?string
    {
        $value = $this->option($name);

        return is_string($value) && $value !== '' ? $value : null;
    }
}
