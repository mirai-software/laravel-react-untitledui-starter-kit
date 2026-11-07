<?php

namespace App\Concerns;

use Illuminate\Support\Str;

/**
 * Fortify lowercases the email on login and password reset (`lowercase_usernames`), so the app
 * saves it lowercase too: otherwise those lookups miss, and the unique rule lets case variants in.
 */
trait NormalizesEmail
{
    /**
     * Lowercase the request's email, if it's a string. Call it from prepareForValidation().
     */
    protected function normalizeEmail(): void
    {
        $email = $this->input('email');

        if (is_string($email)) {
            $this->merge(['email' => Str::lower($email)]);
        }
    }
}
