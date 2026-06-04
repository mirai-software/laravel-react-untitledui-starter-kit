import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import RoleForm, {
    type PermissionGroup,
    type RoleFormData,
} from '@/components/roles/role-form';
import { dashboard } from '@/routes';
import { index } from '@/routes/roles';
import type { PageWithBreadcrumbs } from '@/types';

type Props = {
    role: RoleFormData;
    permissionGroups: PermissionGroup[];
};

const EditRole: PageWithBreadcrumbs<Props> = ({ role, permissionGroups }) => (
    <>
        <Head title={`Modifica ruolo · ${role.name}`} />
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Heading
                title="Modifica ruolo"
                description="Aggiorna nome e permessi del ruolo."
            />
            <div className="max-w-3xl">
                <RoleForm role={role} permissionGroups={permissionGroups} />
            </div>
        </div>
    </>
);

EditRole.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Ruoli', href: index() },
        { title: 'Modifica', href: index() },
    ],
};

export default EditRole;
