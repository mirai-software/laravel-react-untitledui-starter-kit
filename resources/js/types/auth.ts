/** The permissions seeded by `RolePermissionSeeder`, named `resource.action`. */
export type AppPermission =
    | 'roles.view'
    | 'roles.create'
    | 'roles.update'
    | 'roles.delete'
    | 'users.view'
    | 'users.create'
    | 'users.update'
    | 'users.delete';

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    /** The current user's effective permissions (all of them for `admin`). */
    permissions: AppPermission[];
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
