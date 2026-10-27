import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import type { PermissionGroup } from '@/components/roles/role-form';
import { RoleForm } from '@/components/roles/role-form';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/roles';

type CreateRoleProps = {
    permissionGroups: PermissionGroup[];
};

const CreateRole = ({ permissionGroups }: CreateRoleProps) => (
    <>
        <Head title="Nuovo ruolo" />

        <div className="flex max-w-4xl flex-col gap-8 p-4 md:p-6">
            <PageHeader
                title="Nuovo ruolo"
                description="Crea un ruolo e scegli i suoi permessi."
            />
            <RoleForm permissionGroups={permissionGroups} />
        </div>
    </>
);

CreateRole.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Ruoli', href: index() },
        { title: 'Nuovo', href: create() },
    ],
};

export default CreateRole;
