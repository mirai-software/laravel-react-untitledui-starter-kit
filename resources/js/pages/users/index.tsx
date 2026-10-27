import { Head, router } from '@inertiajs/react';
import { Edit01, Plus, RefreshCcw01, SlashCircle01 } from '@untitledui/icons';
import { useState } from 'react';
import { Avatar } from '@/components/base/avatar/avatar';
import { Badge, BadgeWithDot } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { ConfirmModal } from '@/components/confirm-modal';
import { PageHeader } from '@/components/page-header';
import { useInitials } from '@/hooks/use-initials';
import { usePermissions } from '@/hooks/use-permissions';
import { dashboard } from '@/routes';
import { create, destroy, edit, index, restore } from '@/routes/users';

type UserRow = {
    id: number;
    name: string;
    email: string;
    roles: string[];
    is_active: boolean;
    is_current_user: boolean;
};

type UsersIndexProps = {
    users: UserRow[];
};

const UsersIndex = ({ users }: UsersIndexProps) => {
    const { can } = usePermissions();
    const getInitials = useInitials();
    const [userToDeactivate, setUserToDeactivate] = useState<UserRow | null>(
        null,
    );
    const [isDeactivating, setIsDeactivating] = useState(false);

    const deactivateUser = (): void => {
        if (userToDeactivate === null) {
            return;
        }

        router.delete(destroy(userToDeactivate.id).url, {
            preserveScroll: true,
            onStart: () => setIsDeactivating(true),
            onFinish: () => {
                setIsDeactivating(false);
                setUserToDeactivate(null);
            },
        });
    };

    const restoreUser = (user: UserRow): void => {
        router.put(restore(user.id).url, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Utenti" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Utenti"
                    description="Gestisci gli utenti, i loro ruoli e lo stato dell'account."
                    actions={
                        can('users.create') && (
                            <Button href={create().url} iconLeading={Plus}>
                                Nuovo utente
                            </Button>
                        )
                    }
                />

                <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary ring-inset">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-secondary bg-secondary text-xs font-semibold text-quaternary">
                                <th className="px-6 py-3">Utente</th>
                                <th className="px-6 py-3">Ruoli</th>
                                <th className="px-6 py-3">Stato</th>
                                <th className="px-6 py-3">
                                    <span className="sr-only">Azioni</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                size="md"
                                                alt={user.name}
                                                initials={getInitials(
                                                    user.name,
                                                )}
                                            />
                                            <div className="flex min-w-0 flex-col">
                                                <span className="truncate font-medium text-primary">
                                                    {user.name}
                                                    {user.is_current_user &&
                                                        ' (tu)'}
                                                </span>
                                                <span className="truncate text-tertiary">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.length > 0 ? (
                                                user.roles.map((role) => (
                                                    <Badge
                                                        key={role}
                                                        color="brand"
                                                        size="sm"
                                                    >
                                                        {role}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-tertiary">
                                                    —
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <BadgeWithDot
                                            color={
                                                user.is_active
                                                    ? 'success'
                                                    : 'gray'
                                            }
                                            size="sm"
                                        >
                                            {user.is_active
                                                ? 'Attivo'
                                                : 'Disattivato'}
                                        </BadgeWithDot>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            {user.is_active &&
                                                can('users.update') && (
                                                    <Button
                                                        color="tertiary"
                                                        size="sm"
                                                        href={edit(user.id).url}
                                                        iconLeading={Edit01}
                                                    >
                                                        Modifica
                                                    </Button>
                                                )}
                                            {user.is_active &&
                                                !user.is_current_user &&
                                                can('users.delete') && (
                                                    <Button
                                                        color="tertiary-destructive"
                                                        size="sm"
                                                        iconLeading={
                                                            SlashCircle01
                                                        }
                                                        onPress={() =>
                                                            setUserToDeactivate(
                                                                user,
                                                            )
                                                        }
                                                    >
                                                        Disattiva
                                                    </Button>
                                                )}
                                            {!user.is_active &&
                                                can('users.delete') && (
                                                    <Button
                                                        color="tertiary"
                                                        size="sm"
                                                        iconLeading={
                                                            RefreshCcw01
                                                        }
                                                        onPress={() =>
                                                            restoreUser(user)
                                                        }
                                                    >
                                                        Riattiva
                                                    </Button>
                                                )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={userToDeactivate !== null}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setUserToDeactivate(null);
                    }
                }}
                title={`Disattivare ${userToDeactivate?.name ?? ''}?`}
                description="L'utente non potrà più accedere finché non verrà riattivato. I suoi dati restano conservati."
                confirmLabel="Disattiva utente"
                isDestructive
                isProcessing={isDeactivating}
                onConfirm={deactivateUser}
            />
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
