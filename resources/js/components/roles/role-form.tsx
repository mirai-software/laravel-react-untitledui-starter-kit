import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { Button } from '@/components/base/buttons/button';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Input } from '@/components/base/input/input';
import { index, store, update } from '@/routes/roles';

export type Permission = {
    id: number;
    name: string;
    action: string;
};

export type PermissionGroup = {
    group: string;
    permissions: Permission[];
};

export type RoleFormData = {
    id: number;
    name: string;
    permissions: string[];
    is_protected: boolean;
};

type Props = {
    permissionGroups: PermissionGroup[];
    role?: RoleFormData;
};

const RoleForm = ({ permissionGroups, role }: Props) => {
    const isEdit = Boolean(role);

    const form = useForm<{ name: string; permissions: string[] }>({
        name: role?.name ?? '',
        permissions: role?.permissions ?? [],
    });

    const togglePermission = (name: string, selected: boolean): void => {
        form.setData(
            'permissions',
            selected
                ? [...form.data.permissions, name]
                : form.data.permissions.filter(
                      (permission) => permission !== name,
                  ),
        );
    };

    const toggleGroup = (group: PermissionGroup, selected: boolean): void => {
        const names = group.permissions.map((permission) => permission.name);

        form.setData(
            'permissions',
            selected
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
        <form onSubmit={submit} className="space-y-8">
            <Input
                label="Nome ruolo"
                value={form.data.name}
                onChange={(value) => form.setData('name', value)}
                isRequired
                isDisabled={role?.is_protected}
                isInvalid={!!form.errors.name}
                hint={
                    role?.is_protected
                        ? 'Ruolo protetto: il nome non è modificabile.'
                        : form.errors.name
                }
                placeholder="es. editor"
                className="max-w-md"
            />

            <div className="space-y-3">
                <div>
                    <h2 className="text-sm font-semibold text-text-primary">
                        Permessi
                    </h2>
                    <p className="text-sm text-text-tertiary">
                        Seleziona i permessi assegnati a questo ruolo.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {permissionGroups.map((group) => {
                        const names = group.permissions.map((p) => p.name);
                        const selectedCount = names.filter((name) =>
                            form.data.permissions.includes(name),
                        ).length;
                        const allSelected = selectedCount === names.length;

                        return (
                            <fieldset
                                key={group.group}
                                className="rounded-xl border border-border-secondary p-4"
                            >
                                <Checkbox
                                    isSelected={allSelected}
                                    isIndeterminate={
                                        selectedCount > 0 && !allSelected
                                    }
                                    onChange={(selected) =>
                                        toggleGroup(group, selected)
                                    }
                                    label={
                                        <span className="font-semibold capitalize">
                                            {group.group}
                                        </span>
                                    }
                                />
                                <div className="mt-3 space-y-2 border-t border-border-secondary pt-3 pl-1">
                                    {group.permissions.map((permission) => (
                                        <Checkbox
                                            key={permission.id}
                                            isSelected={form.data.permissions.includes(
                                                permission.name,
                                            )}
                                            onChange={(selected) =>
                                                togglePermission(
                                                    permission.name,
                                                    selected,
                                                )
                                            }
                                            label={
                                                <span className="capitalize">
                                                    {permission.action}
                                                </span>
                                            }
                                        />
                                    ))}
                                </div>
                            </fieldset>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" isLoading={form.processing}>
                    {isEdit ? 'Salva modifiche' : 'Crea ruolo'}
                </Button>
                <Button color="secondary" href={index().url}>
                    Annulla
                </Button>
            </div>
        </form>
    );
};

export default RoleForm;
