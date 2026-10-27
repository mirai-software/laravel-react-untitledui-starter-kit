import { Head, router } from '@inertiajs/react';
import { Edit01, Plus, Trash01 } from '@untitledui/icons';
import { useState } from 'react';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { ConfirmModal } from '@/components/confirm-modal';
import { PageHeader } from '@/components/page-header';
import { usePermissions } from '@/hooks/use-permissions';
import { dashboard } from '@/routes';
import { create, destroy, edit, index } from '@/routes/roles';

type RoleRow = {
    id: number;
    name: string;
    permissions_count: number;
    is_protected: boolean;
};

type RolesIndexProps = {
    roles: RoleRow[];
};

const RolesIndex = ({ roles }: RolesIndexProps) => {
    const { can } = usePermissions();
    const [roleToDelete, setRoleToDelete] = useState<RoleRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const canUpdate = can('roles.update');
    const canDelete = can('roles.delete');

    const deleteRole = (): void => {
        if (roleToDelete === null) {
            return;
        }

        router.delete(destroy(roleToDelete.id).url, {
            preserveScroll: true,
            onStart: () => setIsDeleting(true),
            onFinish: () => {
                setIsDeleting(false);
                setRoleToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Ruoli" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Ruoli"
                    description="Gestisci i ruoli e i permessi che assegnano."
                    actions={
                        can('roles.create') && (
                            <Button href={create().url} iconLeading={Plus}>
                                Nuovo ruolo
                            </Button>
                        )
                    }
                />

                <div className="overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary ring-inset">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-secondary bg-secondary text-xs font-semibold text-quaternary">
                                <th className="px-6 py-3">Nome</th>
                                <th className="px-6 py-3">Permessi</th>
                                <th className="px-6 py-3">
                                    <span className="sr-only">Azioni</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary">
                            {roles.map((role) => (
                                <tr key={role.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-primary">
                                                {role.name}
                                            </span>
                                            {role.is_protected && (
                                                <Badge color="gray" size="sm">
                                                    protetto
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-tertiary">
                                        {role.permissions_count}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            {canUpdate && (
                                                <Button
                                                    color="tertiary"
                                                    size="sm"
                                                    href={edit(role.id).url}
                                                    iconLeading={Edit01}
                                                >
                                                    Modifica
                                                </Button>
                                            )}
                                            {canDelete &&
                                                !role.is_protected && (
                                                    <Button
                                                        color="tertiary-destructive"
                                                        size="sm"
                                                        iconLeading={Trash01}
                                                        onPress={() =>
                                                            setRoleToDelete(
                                                                role,
                                                            )
                                                        }
                                                    >
                                                        Elimina
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
                isOpen={roleToDelete !== null}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setRoleToDelete(null);
                    }
                }}
                title={`Eliminare il ruolo "${roleToDelete?.name ?? ''}"?`}
                description="Gli utenti con questo ruolo perderanno i suoi permessi. L'operazione non si può annullare."
                confirmLabel="Elimina ruolo"
                isDestructive
                isProcessing={isDeleting}
                onConfirm={deleteRole}
            />
        </>
    );
};

RolesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Ruoli', href: index() },
    ],
};

export default RolesIndex;
