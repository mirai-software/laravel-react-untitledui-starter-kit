import { Form, Head } from '@inertiajs/react';

import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import TextLink from '@/components/text-link';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Password dimenticata" />
            {status && (
                <div className="text-success-600 mb-4 text-center text-sm font-medium">
                    {status}
                </div>
            )}
            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <Input
                                name="email"
                                type="email"
                                label="Indirizzo email"
                                autoComplete="off"
                                autoFocus
                                placeholder="email@example.com"
                                isInvalid={!!errors.email}
                                hint={errors.email}
                            />
                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="w-full"
                                    type="submit"
                                    isDisabled={processing}
                                    isLoading={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    Invia link di reimpostazione
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
                <div className="space-x-1 text-center text-sm text-text-tertiary">
                    <span>Oppure torna al</span>
                    <TextLink href={login()}>login</TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Password dimenticata',
    description:
        'Inserisci la tua email per ricevere il link di reimpostazione',
};
