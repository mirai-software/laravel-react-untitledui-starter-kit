import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import { Button } from '@/components/base/buttons/button';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Input } from '@/components/base/input/input';
import { index, store, update } from '@/routes/users';

export type UserFormData = {
    id: number;
    name: string;
    email: string;
    roles: string[];
};

type UserFormValues = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    roles: string[];
};

type Props = {
    roles: string[];
    user?: UserFormData;
};

const UserForm = ({ roles, user }: Props) => {
    const isEdit = Boolean(user);

    const form = useForm<UserFormValues>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
        roles: user?.roles ?? [],
    });

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

        if (user) {
            form.put(update(user.id).url, { preserveScroll: true });
            return;
        }

        form.post(store().url);
    };

    return (
        <form onSubmit={submit} className="space-y-8">
            <div className="grid max-w-md gap-5">
                <Input
                    label="Nome"
                    value={form.data.name}
                    onChange={(value) => form.setData('name', value)}
                    isRequired
                    isInvalid={!!form.errors.name}
                    hint={form.errors.name}
                    placeholder="es. Mario Rossi"
                />
                <Input
                    type="email"
                    label="Email"
                    value={form.data.email}
                    onChange={(value) => form.setData('email', value)}
                    isRequired
                    isInvalid={!!form.errors.email}
                    hint={form.errors.email}
                    placeholder="email@example.com"
                />
                <Input
                    type="password"
                    label="Password"
                    value={form.data.password}
                    onChange={(value) => form.setData('password', value)}
                    isRequired={!isEdit}
                    autoComplete="new-password"
                    isInvalid={!!form.errors.password}
                    hint={
                        form.errors.password ??
                        (isEdit
                            ? 'Lascia vuoto per non modificare la password.'
                            : undefined)
                    }
                    placeholder="Password"
                />
                <Input
                    type="password"
                    label="Conferma password"
                    value={form.data.password_confirmation}
                    onChange={(value) =>
                        form.setData('password_confirmation', value)
                    }
                    isRequired={!isEdit}
                    autoComplete="new-password"
                    placeholder="Conferma password"
                />
            </div>

            <div className="space-y-3">
                <div>
                    <h2 className="text-sm font-semibold text-text-primary">
                        Ruoli
                    </h2>
                    <p className="text-sm text-text-tertiary">
                        Seleziona i ruoli assegnati a questo utente.
                    </p>
                </div>

                <div className="max-w-md space-y-3 rounded-xl border border-border-secondary p-4">
                    {roles.length > 0 ? (
                        roles.map((role) => (
                            <Checkbox
                                key={role}
                                isSelected={form.data.roles.includes(role)}
                                onChange={(selected) =>
                                    toggleRole(role, selected)
                                }
                                label={role}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-text-tertiary">
                            Nessun ruolo disponibile.
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" isLoading={form.processing}>
                    {isEdit ? 'Salva modifiche' : 'Crea utente'}
                </Button>
                <Button color="secondary" href={index().url}>
                    Annulla
                </Button>
            </div>
        </form>
    );
};

export default UserForm;
