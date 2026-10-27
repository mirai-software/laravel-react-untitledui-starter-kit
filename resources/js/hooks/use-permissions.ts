import { usePage } from '@inertiajs/react';
import type { AppPermission } from '@/types';

export type UsePermissionsReturn = {
    permissions: AppPermission[];
    can: (permission: AppPermission) => boolean;
    canAny: (permissions: AppPermission[]) => boolean;
};

/**
 * The current user's effective permissions, shared by `HandleInertiaRequests`.
 * The admin (who passes every check through Gate::before) gets all of them.
 */
export function usePermissions(): UsePermissionsReturn {
    const { permissions } = usePage().props.auth;

    const can = (permission: AppPermission): boolean =>
        permissions.includes(permission);

    const canAny = (required: AppPermission[]): boolean =>
        required.some((permission) => permissions.includes(permission));

    return { permissions, can, canAny };
}
