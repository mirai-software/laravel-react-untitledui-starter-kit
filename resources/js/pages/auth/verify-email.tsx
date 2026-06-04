import { Form, Head } from '@inertiajs/react';

import { Button } from '@/components/base/buttons/button';
import TextLink from '@/components/text-link';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Verifica email" />
            {status === 'verification-link-sent' && (
                <div className="text-success-600 mb-4 text-center text-sm font-medium">
                    Un nuovo link di verifica è stato inviato all'indirizzo
                    email fornito durante la registrazione.
                </div>
            )}
            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            type="submit"
                            isDisabled={processing}
                            isLoading={processing}
                            color="secondary"
                        >
                            Reinvia email di verifica
                        </Button>
                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            Esci
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verifica email',
    description:
        'Verifica il tuo indirizzo email cliccando sul link che ti abbiamo appena inviato.',
};
