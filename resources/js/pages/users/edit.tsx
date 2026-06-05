import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import UserForm, { type UserFormData } from '@/components/users/user-form';
import { dashboard } from '@/routes';
import { index } from '@/routes/users';
import type { PageWithBreadcrumbs } from '@/types';

type Props = {
    user: UserFormData;
    roles: string[];
};

const EditUser: PageWithBreadcrumbs<Props> = ({ user, roles }) => (
    <>
        <Head title={`Modifica utente · ${user.name}`} />
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Heading
                title="Modifica utente"
                description={`Aggiorna i dati e i ruoli di ${user.name}.`}
            />
            <div className="max-w-3xl">
                <UserForm user={user} roles={roles} />
            </div>
        </div>
    </>
);

EditUser.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Utenti', href: index() },
        { title: 'Modifica', href: index() },
    ],
};

export default EditUser;
