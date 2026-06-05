import { Head } from '@inertiajs/react';

import Heading from '@/components/heading';
import UserForm from '@/components/users/user-form';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/users';
import type { PageWithBreadcrumbs } from '@/types';

type Props = {
    roles: string[];
};

const CreateUser: PageWithBreadcrumbs<Props> = ({ roles }) => (
    <>
        <Head title="Nuovo utente" />
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Heading
                title="Nuovo utente"
                description="Crea un utente e assegna i ruoli."
            />
            <div className="max-w-3xl">
                <UserForm roles={roles} />
            </div>
        </div>
    </>
);

CreateUser.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Utenti', href: index() },
        { title: 'Nuovo', href: create() },
    ],
};

export default CreateUser;
