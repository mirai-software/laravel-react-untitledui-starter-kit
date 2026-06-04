import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { Button } from '@/components/base/buttons/button';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import Heading from '@/components/heading';
import { dashboard } from '@/routes';
import { index } from '@/routes/users';
import { update } from '@/routes/users/roles';
import type { PageWithBreadcrumbs } from '@/types';

type Props = {
    user: {
        id: number;
        name: string;
        email: string;
        roles: string[];
    };
    roles: string[];
};

const EditUserRoles: PageWithBreadcrumbs<Props> = ({ user, roles }) => {
    const form = useForm<{ roles: string[] }>({ roles: user.roles });

    const toggleRole = (role: string, selected: boolean): void => {
        form.setData(
            'roles',
            selected
                ? [...form.data.roles, role]
                : form.data.roles.filter((current) => current !== role),
        );
    };

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        form.put(update(user.id).url, { preserveScroll: true });
    };

    return (
        <>
            <Head title={`Ruoli · ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Gestisci ruoli"
                    description={`Ruoli assegnati a ${user.name} (${user.email}).`}
                />

                <form onSubmit={submit} className="max-w-md space-y-6">
                    <div className="space-y-3 rounded-xl border border-border-secondary p-4">
                        {roles.map((role) => (
                            <Checkbox
                                key={role}
                                isSelected={form.data.roles.includes(role)}
                                onChange={(selected) =>
                                    toggleRole(role, selected)
                                }
                                label={role}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" isLoading={form.processing}>
                            Salva ruoli
                        </Button>
                        <Button color="secondary" href={index().url}>
                            Annulla
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

EditUserRoles.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Utenti', href: index() },
        { title: 'Ruoli', href: index() },
    ],
};

export default EditUserRoles;
