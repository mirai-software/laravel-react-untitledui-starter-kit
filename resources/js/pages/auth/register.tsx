import { Form, Head } from '@inertiajs/react';

import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import TextLink from '@/components/text-link';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <>
            <Head title="Registrati" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <Input
                                name="name"
                                type="text"
                                label="Nome"
                                isRequired
                                autoFocus
                                autoComplete="name"
                                placeholder="Nome e cognome"
                                isInvalid={!!errors.name}
                                hint={errors.name}
                            />
                            <Input
                                name="email"
                                type="email"
                                label="Indirizzo email"
                                isRequired
                                autoComplete="email"
                                placeholder="email@example.com"
                                isInvalid={!!errors.email}
                                hint={errors.email}
                            />
                            <Input
                                name="password"
                                type="password"
                                label="Password"
                                isRequired
                                autoComplete="new-password"
                                placeholder="Password"
                                isInvalid={!!errors.password}
                                hint={errors.password}
                            />
                            <Input
                                name="password_confirmation"
                                type="password"
                                label="Conferma password"
                                isRequired
                                autoComplete="new-password"
                                placeholder="Conferma password"
                                isInvalid={!!errors.password_confirmation}
                                hint={errors.password_confirmation}
                            />
                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                isLoading={processing}
                                data-test="register-user-button"
                            >
                                Crea account
                            </Button>
                        </div>
                        <div className="text-center text-sm text-text-tertiary">
                            Hai già un account?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Accedi
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Crea un account',
    description: 'Inserisci i tuoi dati per creare il tuo account',
};
