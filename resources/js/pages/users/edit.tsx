import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import type { UserFormUser } from '@/components/users/user-form';
import { UserForm } from '@/components/users/user-form';
import { dashboard } from '@/routes';
import { index } from '@/routes/users';

type EditUserProps = {
    user: UserFormUser;
    roles: string[];
    lockedRoles: string[];
    passwordRules: string;
};

const EditUser = ({
    user,
    roles,
    lockedRoles,
    passwordRules,
}: EditUserProps) => (
    <>
        <Head title={`Modifica ${user.name}`} />

        <div className="flex max-w-4xl flex-col gap-8 p-4 md:p-6">
            <PageHeader
                title={`Modifica ${user.name}`}
                description="Aggiorna i dati e i ruoli dell'utente."
            />
            <UserForm
                user={user}
                roles={roles}
                lockedRoles={lockedRoles}
                passwordRules={passwordRules}
            />
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
