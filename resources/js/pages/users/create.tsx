import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/page-header';
import { UserForm } from '@/components/users/user-form';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/users';

type CreateUserProps = {
    roles: string[];
    passwordRules: string;
};

const CreateUser = ({ roles, passwordRules }: CreateUserProps) => (
    <>
        <Head title="Nuovo utente" />

        <div className="flex max-w-4xl flex-col gap-8 p-4 md:p-6">
            <PageHeader
                title="Nuovo utente"
                description="Crea un utente e assegna i suoi ruoli."
            />
            <UserForm roles={roles} passwordRules={passwordRules} />
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
