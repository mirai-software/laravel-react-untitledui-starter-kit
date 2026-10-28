import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import type {
    PermissionGroup,
    RoleFormRole,
} from '@/components/roles/role-form';
import { RoleForm } from '@/components/roles/role-form';
import { roleLabel } from '@/lib/roles';
import { dashboard } from '@/routes';
import { index } from '@/routes/roles';

type EditRoleProps = {
    role: RoleFormRole;
    permissionGroups: PermissionGroup[];
};

const EditRole = ({ role, permissionGroups }: EditRoleProps) => (
    <>
        <Head title={`Modifica ${roleLabel(role.name)}`} />

        <div className="flex max-w-4xl flex-col gap-8 p-4 md:p-6">
            <PageHeader
                title={`Modifica il ruolo "${roleLabel(role.name)}"`}
                description="Aggiorna il nome e i permessi del ruolo."
            />
            <RoleForm role={role} permissionGroups={permissionGroups} />
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
