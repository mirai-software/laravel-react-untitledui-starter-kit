import { usePage } from '@inertiajs/react';
import type { AppPermission } from '@/types/permissions';

export type UsePermissionsReturn = {
    permissions: AppPermission[];
    can: (permission: AppPermission) => boolean;
};

/** The shared `auth.permissions` prop, kept out of upstream's `Auth` type. */
type PermissionsPageProps = {
    auth: { permissions: AppPermission[] };
};

/**
 * The current user's effective permissions, shared by `HandleInertiaRequests`.
 * The admin (who passes every check through Gate::before) gets all of them.
 */
export function usePermissions(): UsePermissionsReturn {
    const { permissions } = usePage<PermissionsPageProps>().props.auth;

    const can = (permission: AppPermission): boolean =>
        permissions.includes(permission);

    return { permissions, can };
}
