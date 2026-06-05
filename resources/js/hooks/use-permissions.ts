import { usePage } from '@inertiajs/react';

import type { AppPermission } from '@/types/auth';

export type UsePermissionsReturn = {
    permissions: AppPermission[];
    can: (permission: AppPermission) => boolean;
    canAny: (permissions: AppPermission[]) => boolean;
};

/**
 * Permessi effettivi dell'utente corrente, condivisi da `HandleInertiaRequests`.
 * L'admin (bypass via Gate::before) riceve l'elenco completo.
 */
export function usePermissions(): UsePermissionsReturn {
    const permissions = usePage().props.auth.permissions;

    const can = (permission: AppPermission): boolean =>
        permissions.includes(permission);

    const canAny = (required: AppPermission[]): boolean =>
        required.some((permission) => permissions.includes(permission));

    return { permissions, can, canAny };
}
