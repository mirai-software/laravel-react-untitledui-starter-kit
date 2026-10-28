<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Laravel\Passkeys\Passkey as BasePasskey;

/**
 * The passkeys package's model, with its owner found even when deactivated (soft deleted).
 * Without this, a deactivated user's passkey has no user and its sign-in fails with a 500;
 * with it, AppServiceProvider refuses the sign-in with a clear message.
 */
class Passkey extends BasePasskey
{
    /**
     * Get the user that owns the passkey, deactivated users included.
     *
     * @return BelongsTo<Model, $this>
     */
    public function user(): BelongsTo
    {
        $relation = parent::user();
        $relation->withoutGlobalScope(SoftDeletingScope::class);

        return $relation;
    }
}
