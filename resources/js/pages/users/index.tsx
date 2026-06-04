import { Head } from '@inertiajs/react';
import { Edit01 } from '@untitledui/icons';

import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import Heading from '@/components/heading';
import { dashboard } from '@/routes';
import { index } from '@/routes/users';
import { edit } from '@/routes/users/roles';
import type { PageWithBreadcrumbs } from '@/types';

type UserRow = {
    id: number;
    name: string;
    email: string;
    roles: string[];
};

type Props = {
    users: UserRow[];
};

const UsersIndex: PageWithBreadcrumbs<Props> = ({ users }) => (
    <>
        <Head title="Utenti" />
        <div className="flex h-full flex-1 flex-col gap-6 p-4">
            <Heading
                title="Utenti"
                description="Assegna i ruoli agli utenti."
            />

            <div className="overflow-hidden rounded-xl border border-border-secondary">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-border-secondary bg-bg-secondary">
                        <tr className="text-text-tertiary">
                            <th className="px-4 py-3 font-medium">Utente</th>
                            <th className="px-4 py-3 font-medium">Ruoli</th>
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
                                    <div className="flex justify-end">
                                        <Button
                                            color="tertiary"
                                            size="sm"
                                            href={edit(user.id).url}
                                            iconLeading={Edit01}
                                        >
                                            Gestisci ruoli
                                        </Button>
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

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Utenti', href: index() },
    ],
};

export default UsersIndex;
