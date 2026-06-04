import { Head, router } from '@inertiajs/react';
import { Edit01, Plus, Trash01 } from '@untitledui/icons';

import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import Heading from '@/components/heading';
import { dashboard } from '@/routes';
import { create, destroy, edit, index } from '@/routes/roles';
import type { PageWithBreadcrumbs } from '@/types';

type RoleRow = {
    id: number;
    name: string;
    permissions_count: number;
    is_protected: boolean;
};

type Props = {
    roles: RoleRow[];
};

const RolesIndex: PageWithBreadcrumbs<Props> = ({ roles }) => {
    const handleDelete = (role: RoleRow): void => {
        if (
            window.confirm(
                `Eliminare il ruolo "${role.name}"? L'operazione non è reversibile.`,
            )
        ) {
            router.delete(destroy(role.id).url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Ruoli" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        title="Ruoli"
                        description="Gestisci i ruoli e i permessi assegnati."
                    />
                    <Button href={create().url} iconLeading={Plus}>
                        Nuovo ruolo
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border border-border-secondary">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border-secondary bg-bg-secondary">
                            <tr className="text-text-tertiary">
                                <th className="px-4 py-3 font-medium">Nome</th>
                                <th className="px-4 py-3 font-medium">
                                    Permessi
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Azioni
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-secondary">
                            {roles.map((role) => (
                                <tr key={role.id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-text-primary">
                                                {role.name}
                                            </span>
                                            {role.is_protected && (
                                                <Badge
                                                    color="gray"
                                                    size="sm"
                                                    type="pill-color"
                                                >
                                                    protetto
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-text-tertiary">
                                        {role.permissions_count}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                color="tertiary"
                                                size="sm"
                                                href={edit(role.id).url}
                                                iconLeading={Edit01}
                                            >
                                                Modifica
                                            </Button>
                                            {!role.is_protected && (
                                                <Button
                                                    color="tertiary-destructive"
                                                    size="sm"
                                                    iconLeading={Trash01}
                                                    onClick={() =>
                                                        handleDelete(role)
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
