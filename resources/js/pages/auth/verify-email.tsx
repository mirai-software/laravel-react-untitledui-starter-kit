import { Form, Head } from '@inertiajs/react';
import { Button } from '@/components/base/buttons/button';
import TextLink from '@/components/text-link';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

type VerifyEmailProps = {
    status?: string;
};

const VerifyEmail = ({ status }: VerifyEmailProps) => (
    <>
        <Head title="Verifica email" />

        {status === 'verification-link-sent' && (
            <p className="text-center text-sm font-medium text-success-primary">
                Un nuovo link di verifica è stato inviato all'indirizzo email
                fornito durante la registrazione.
            </p>
        )}

        <Form {...send.form()} className="flex flex-col items-center gap-6">
            {({ processing }) => (
                <>
                    <Button
                        type="submit"
                        color="secondary"
                        size="lg"
                        className="w-full"
                        isDisabled={processing}
                        isLoading={processing}
                    >
                        Reinvia email di verifica
                    </Button>

                    <TextLink href={logout()} className="text-sm">
                        Esci
                    </TextLink>
                </>
            )}
        </Form>
    </>
);

VerifyEmail.layout = {
    title: 'Verifica email',
    description:
        'Verifica il tuo indirizzo email cliccando sul link che ti abbiamo appena inviato.',
};

export default VerifyEmail;
