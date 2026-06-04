import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import RoleForm, { type PermissionGroup } from '@/components/roles/role-form';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/roles';
import type { PageWithBreadcrumbs } from '@/types';

type Props = {
    permissionGroups: PermissionGroup[];
};

const CreateRole: PageWithBreadcrumbs<Props> = ({ permissionGroups }) => (
    <>
        <Head title="Nuovo ruolo" />
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Heading
                title="Nuovo ruolo"
                description="Crea un ruolo e assegna i permessi."
            />
            <div className="max-w-3xl">
                <RoleForm permissionGroups={permissionGroups} />
            </div>
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
