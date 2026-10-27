import { Form, Head } from '@inertiajs/react';
import { ArrowLeft } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { login } from '@/routes';
import { email } from '@/routes/password';

type ForgotPasswordProps = {
    status?: string;
};

const ForgotPassword = ({ status }: ForgotPasswordProps) => (
    <>
        <Head title="Password dimenticata" />

        {status && (
            <p className="text-center text-sm font-medium text-success-primary">
                {status}
            </p>
        )}

        <Form {...email.form()} className="flex flex-col gap-6">
            {({ processing, errors }) => (
                <>
                    <Input
                        name="email"
                        type="email"
                        label="Email"
                        autoFocus
                        autoComplete="off"
                        placeholder="email@example.com"
                        isInvalid={Boolean(errors.email)}
                        hint={errors.email}
                    />

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        isDisabled={processing}
                        isLoading={processing}
                        data-test="email-password-reset-link-button"
                    >
                        Invia link di reimpostazione
                    </Button>
                </>
            )}
        </Form>

        <Button
            href={login().url}
            color="link-gray"
            iconLeading={ArrowLeft}
            className="self-center"
        >
            Torna all'accesso
        </Button>
    </>
);

ForgotPassword.layout = {
    title: 'Password dimenticata',
    description:
        'Inserisci la tua email per ricevere il link di reimpostazione',
};

export default ForgotPassword;
