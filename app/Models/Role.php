<?php

namespace App\Models;

use Database\Factories\RoleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    /** @use HasFactory<RoleFactory> */
    use HasFactory;

    /**
     * Passes every authorization check (Gate::before in AppServiceProvider), so it needs no permissions.
     */
    public const string ADMIN = 'admin';

    /**
     * Given to everyone who registers after the first user (CreateNewUser).
     */
    public const string USER = 'user';

    /**
     * Roles the code depends on by name: they can't be renamed or deleted.
     *
     * @var list<string>
     */
    public const array PROTECTED = [self::ADMIN, self::USER];

    /**
     * Determine whether the role is protected from renaming and deletion.
     */
    public function isProtected(): bool
    {
        return in_array($this->name, self::PROTECTED, true);
    }

    /**
     * Determine whether this is the admin role, which always has every permission.
     */
    public function isAdmin(): bool
    {
        return $this->name === self::ADMIN;
    }
}
