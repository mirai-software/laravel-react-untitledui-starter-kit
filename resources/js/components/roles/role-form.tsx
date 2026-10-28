import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Input } from '@/components/base/input/input';
import { index, store, update } from '@/routes/roles';

export type PermissionOption = {
    id: number;
    name: string;
    action: string;
};

export type PermissionGroup = {
    group: string;
    permissions: PermissionOption[];
};

export type RoleFormRole = {
    id: number;
    name: string;
    permissions: string[];
    is_protected: boolean;
};

type RoleFormProps = {
    permissionGroups: PermissionGroup[];
    role?: RoleFormRole;
};

/** Italian labels for the seeded permission groups and actions; other names show as they are. */
const groupLabels: Record<string, string> = {
    roles: 'Ruoli',
    users: 'Utenti',
};

const actionLabels: Record<string, string> = {
    view: 'Visualizzare',
    create: 'Creare',
    update: 'Modificare',
    delete: 'Eliminare',
};

/** Show actions in the order of their labels above (view, create, update, delete), others after them. */
const actionOrder = Object.keys(actionLabels);

const sortByAction = (permissions: PermissionOption[]): PermissionOption[] => {
    const rank = (action: string): number => {
        const position = actionOrder.indexOf(action);

        return position === -1 ? actionOrder.length : position;
    };

    return [...permissions].sort(
        (first, second) =>
            rank(first.action) - rank(second.action) ||
            first.action.localeCompare(second.action),
    );
};

const RoleForm = ({ permissionGroups, role }: RoleFormProps) => {
    const form = useForm<{ name: string; permissions: string[] }>({
        name: role?.name ?? '',
        permissions: role?.permissions ?? [],
    });

    const togglePermission = (name: string, isSelected: boolean): void => {
        form.setData(
            'permissions',
            isSelected
                ? [...form.data.permissions, name]
                : form.data.permissions.filter(
                      (permission) => permission !== name,
                  ),
        );
    };

    const toggleGroup = (group: PermissionGroup, isSelected: boolean): void => {
        const names = group.permissions.map((permission) => permission.name);

        form.setData(
            'permissions',
            isSelected
                ? [...new Set([...form.data.permissions, ...names])]
                : form.data.permissions.filter(
                      (permission) => !names.includes(permission),
                  ),
        );
    };

    const submit = (event: FormEvent): void => {
        event.preventDefault();

        if (role) {
            form.put(update(role.id).url, { preserveScroll: true });

            return;
        }

        form.post(store().url);
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-8">
            <Input
                label="Nome del ruolo"
                value={form.data.name}
                onChange={(value) => form.setData('name', value)}
                isRequired
                isReadOnly={role?.is_protected}
                isInvalid={Boolean(form.errors.name)}
                hint={
                    form.errors.name ??
                    (role?.is_protected
                        ? 'Ruolo protetto: il nome non si può modificare.'
                        : undefined)
                }
                placeholder="es. editor"
                className="max-w-md"
            />

            <fieldset className="flex flex-col gap-4">
                <legend className="mb-4 flex flex-col gap-1">
                    <span className="text-md font-semibold text-primary">
                        Permessi
                    </span>
                    <span className="text-sm text-tertiary">
                        Scegli cosa possono fare gli utenti con questo ruolo.
                    </span>
                </legend>

                <div className="grid gap-4 sm:grid-cols-2">
                    {permissionGroups.map((group) => {
                        const names = group.permissions.map(
                            (permission) => permission.name,
                        );
                        const selectedCount = names.filter((name) =>
                            form.data.permissions.includes(name),
                        ).length;
                        const isAllSelected = selectedCount === names.length;

                        return (
                            <div
                                key={group.group}
                                className="flex flex-col gap-3 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary ring-inset"
                            >
                                <Checkbox
                                    isSelected={isAllSelected}
                                    isIndeterminate={
                                        selectedCount > 0 && !isAllSelected
                                    }
                                    onChange={(isSelected) =>
                                        toggleGroup(group, isSelected)
                                    }
                                    label={
                                        <span className="font-semibold">
                                            {groupLabels[group.group] ??
                                                group.group}
                                        </span>
                                    }
                                />
                                <div className="flex flex-col gap-2 border-t border-secondary pt-3">
                                    {sortByAction(group.permissions).map(
                                        (permission) => (
                                            <Checkbox
                                                key={permission.id}
                                                isSelected={form.data.permissions.includes(
                                                    permission.name,
                                                )}
                                                onChange={(isSelected) =>
                                                    togglePermission(
                                                        permission.name,
                                                        isSelected,
                                                    )
                                                }
                                                label={
                                                    actionLabels[
                                                        permission.action
                                                    ] ?? permission.action
                                                }
                                            />
                                        ),
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </fieldset>

            <div className="flex items-center gap-3">
                <Button
                    type="submit"
                    isDisabled={form.processing}
                    isLoading={form.processing}
                >
                    {role ? 'Salva modifiche' : 'Crea ruolo'}
                </Button>
                <Button color="secondary" href={index().url}>
                    Annulla
                </Button>
            </div>
        </form>
    );
};

export { RoleForm };
