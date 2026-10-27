import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Input } from '@/components/base/input/input';
import PasswordInput from '@/components/password-input';
import { index, store, update } from '@/routes/users';

export type UserFormUser = {
    id: number;
    name: string;
    email: string;
    roles: string[];
};

type UserFormProps = {
    roles: string[];
    passwordRules: string;
    user?: UserFormUser;
};

type UserFormValues = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    roles: string[];
};

const UserForm = ({ roles, passwordRules, user }: UserFormProps) => {
    const form = useForm<UserFormValues>({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
        roles: user?.roles ?? [],
    });

    const toggleRole = (role: string, isSelected: boolean): void => {
        form.setData(
            'roles',
            isSelected
                ? [...form.data.roles, role]
                : form.data.roles.filter((current) => current !== role),
        );
    };

    const submit = (event: FormEvent): void => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onFinish: () => form.reset('password', 'password_confirmation'),
        };

        if (user) {
            form.put(update(user.id).url, options);

            return;
        }

        form.post(store().url, options);
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-8">
            <div className="flex max-w-md flex-col gap-5">
                <Input
                    label="Nome"
                    value={form.data.name}
                    onChange={(value) => form.setData('name', value)}
                    isRequired
                    autoComplete="off"
                    isInvalid={Boolean(form.errors.name)}
                    hint={form.errors.name}
                    placeholder="Nome e cognome"
                />
                <Input
                    type="email"
                    label="Email"
                    value={form.data.email}
                    onChange={(value) => form.setData('email', value)}
                    isRequired
                    autoComplete="off"
                    isInvalid={Boolean(form.errors.email)}
                    hint={form.errors.email}
                    placeholder="email@example.com"
                />
                <PasswordInput
                    label="Password"
                    value={form.data.password}
                    onChange={(value) => form.setData('password', value)}
                    isRequired={!user}
                    autoComplete="new-password"
                    passwordrules={passwordRules}
                    placeholder="••••••••"
                    isInvalid={Boolean(form.errors.password)}
                    hint={
                        form.errors.password ??
                        (user
                            ? 'Lascia vuoto per non cambiare la password.'
                            : undefined)
                    }
                />
                <PasswordInput
                    label="Conferma password"
                    value={form.data.password_confirmation}
                    onChange={(value) =>
                        form.setData('password_confirmation', value)
                    }
                    isRequired={!user}
                    autoComplete="new-password"
                    passwordrules={passwordRules}
                    placeholder="••••••••"
                />
            </div>

            <fieldset className="flex max-w-md flex-col">
                <legend className="mb-4 flex flex-col gap-1">
                    <span className="text-md font-semibold text-primary">
                        Ruoli
                    </span>
                    <span className="text-sm text-tertiary">
                        Scegli i ruoli assegnati a questo utente.
                    </span>
                </legend>

                <div className="flex flex-col gap-3 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-secondary ring-inset">
                    {roles.length > 0 ? (
                        roles.map((role) => (
                            <Checkbox
                                key={role}
                                isSelected={form.data.roles.includes(role)}
                                onChange={(isSelected) =>
                                    toggleRole(role, isSelected)
                                }
                                label={role}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-tertiary">
                            Nessun ruolo disponibile.
                        </p>
                    )}
                </div>
            </fieldset>

            <div className="flex items-center gap-3">
                <Button
                    type="submit"
                    isDisabled={form.processing}
                    isLoading={form.processing}
                >
                    {user ? 'Salva modifiche' : 'Crea utente'}
                </Button>
                <Button color="secondary" href={index().url}>
                    Annulla
                </Button>
            </div>
        </form>
    );
};

export { UserForm };
