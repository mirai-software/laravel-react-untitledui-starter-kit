import { Head, router } from '@inertiajs/react';
import { Edit01, Plus, RefreshCcw01, SlashCircle01 } from '@untitledui/icons';

import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import Heading from '@/components/heading';
import { usePermissions } from '@/hooks/use-permissions';
import { dashboard } from '@/routes';
import { create, destroy, edit, index, restore } from '@/routes/users';
import type { PageWithBreadcrumbs } from '@/types';

type UserRow = {
    id: number;
    name: string;
    email: string;
    roles: string[];
    is_active: boolean;
};

type Props = {
    users: UserRow[];
};

const UsersIndex: PageWithBreadcrumbs<Props> = ({ users }) => {
    const { can } = usePermissions();

    const handleDeactivate = (user: UserRow): void => {
        if (
            window.confirm(
                `Disattivare "${user.name}"? L'utente non potrà più accedere finché non viene riattivato.`,
            )
        ) {
            router.delete(destroy(user.id).url, { preserveScroll: true });
        }
    };

    const handleRestore = (user: UserRow): void => {
        router.put(restore(user.id).url, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Utenti" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        title="Utenti"
                        description="Gestisci gli utenti, i ruoli assegnati e lo stato dell'account."
                    />
                    {can('users.create') && (
                        <Button href={create().url} iconLeading={Plus}>
                            Nuovo utente
                        </Button>
                    )}
                </div>

                <div className="overflow-hidden rounded-xl border border-border-secondary">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border-secondary bg-bg-secondary">
                            <tr className="text-text-tertiary">
                                <th className="px-4 py-3 font-medium">
                                    Utente
                                </th>
                                <th className="px-4 py-3 font-medium">Ruoli</th>
                                <th className="px-4 py-3 font-medium">Stato</th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Azioni
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-secondary">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-text-primary">
                                                {user.name}
                                            </span>
                                            <span className="text-text-tertiary">
                                                {user.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.length > 0 ? (
                                                user.roles.map((role) => (
                                                    <Badge
                                                        key={role}
                                                        color="brand"
                                                        size="sm"
                                                        type="pill-color"
                                                    >
                                                        {role}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-text-tertiary">
                                                    —
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            color={
                                                user.is_active
                                                    ? 'success'
                                                    : 'gray'
                                            }
                                            size="sm"
                                            type="pill-color"
                                        >
                                            {user.is_active
                                                ? 'Attivo'
                                                : 'Disattivato'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {user.is_active ? (
                                                <>
                                                    {can('users.update') && (
                                                        <Button
                                                            color="tertiary"
                                                            size="sm"
                                                            href={
                                                                edit(user.id)
                                                                    .url
                                                            }
                                                            iconLeading={Edit01}
                                                        >
                                                            Modifica
                                                        </Button>
                                                    )}
                                                    {can('users.delete') && (
                                                        <Button
                                                            color="tertiary-destructive"
                                                            size="sm"
                                                            iconLeading={
                                                                SlashCircle01
                                                            }
                                                            onClick={() =>
                                                                handleDeactivate(
                                                                    user,
                                                                )
                                                            }
                                                        >
                                                            Disattiva
                                                        </Button>
                                                    )}
                                                </>
                                            ) : (
                                                can('users.delete') && (
                                                    <Button
                                                        color="tertiary"
                                                        size="sm"
                                                        iconLeading={
                                                            RefreshCcw01
                                                        }
                                                        onClick={() =>
                                                            handleRestore(user)
                                                        }
                                                    >
                                                        Riattiva
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Utenti', href: index() },
    ],
};

export default UsersIndex;
