import { Head, router } from '@inertiajs/react';
import { Edit01, Plus, Trash01 } from '@untitledui/icons';
import { useState } from 'react';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { ConfirmModal } from '@/components/confirm-modal';
import { PageHeader } from '@/components/page-header';
import { usePermissions } from '@/hooks/use-permissions';
import { roleLabel } from '@/lib/roles';
import { dashboard } from '@/routes';
import { create, destroy, edit, index } from '@/routes/roles';

type RoleRow = {
    id: number;
    name: string;
    permissions_count: number;
    /** The admin role passes every check, whatever permissions it has. */
    has_all_permissions: boolean;
    is_protected: boolean;
    /** What the current user can do on this row (computed by the server). */
    can: {
        update: boolean;
        delete: boolean;
    };
};

type RolesIndexProps = {
    roles: RoleRow[];
};

const RolesIndex = ({ roles }: RolesIndexProps) => {
    const { can } = usePermissions();
    // The selected role stays set while the dialog closes, so its title doesn't go blank.
    const [roleToDelete, setRoleToDelete] = useState<RoleRow | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const askToDelete = (role: RoleRow): void => {
        setRoleToDelete(role);
        setIsConfirmOpen(true);
    };

    const deleteRole = (): void => {
        if (roleToDelete === null) {
            return;
        }

        router.delete(destroy(roleToDelete.id).url, {
            preserveScroll: true,
            onStart: () => setIsDeleting(true),
            onFinish: () => {
                setIsDeleting(false);
                setIsConfirmOpen(false);
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

                <div className="relative overflow-x-auto rounded-xl bg-primary shadow-xs ring-1 ring-secondary ring-inset">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-secondary bg-secondary text-xs text-quaternary *:font-semibold">
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
                                                {roleLabel(role.name)}
                                            </span>
                                            {role.is_protected && (
                                                <Badge color="gray" size="sm">
                                                    Protetto
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-tertiary">
                                        {role.has_all_permissions
                                            ? 'Tutti'
                                            : role.permissions_count}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            {role.can.update && (
                                                <Button
                                                    color="tertiary"
                                                    size="sm"
                                                    href={edit(role.id).url}
                                                    iconLeading={Edit01}
                                                    aria-label={`Modifica ${roleLabel(role.name)}`}
                                                >
                                                    Modifica
                                                </Button>
                                            )}
                                            {role.can.delete && (
                                                <Button
                                                    color="tertiary-destructive"
                                                    size="sm"
                                                    iconLeading={Trash01}
                                                    aria-label={`Elimina ${roleLabel(role.name)}`}
                                                    onPress={() =>
                                                        askToDelete(role)
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
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title={`Eliminare il ruolo "${roleToDelete === null ? '' : roleLabel(roleToDelete.name)}"?`}
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
