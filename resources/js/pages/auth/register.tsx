import { Form, Head } from '@inertiajs/react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { login } from '@/routes';
import { store } from '@/routes/register';

type RegisterProps = {
    passwordRules: string;
};

const Register = ({ passwordRules }: RegisterProps) => (
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
                    <div className="flex flex-col gap-5">
                        <Input
                            name="name"
                            label="Nome"
                            isRequired
                            autoFocus
                            autoComplete="name"
                            placeholder="Nome e cognome"
                            isInvalid={Boolean(errors.name)}
                            hint={errors.name}
                        />

                        <Input
                            name="email"
                            type="email"
                            label="Email"
                            isRequired
                            autoComplete="email"
                            placeholder="email@example.com"
                            isInvalid={Boolean(errors.email)}
                            hint={errors.email}
                        />

                        <PasswordInput
                            name="password"
                            label="Password"
                            isRequired
                            autoComplete="new-password"
                            placeholder="••••••••"
                            passwordrules={passwordRules}
                            isInvalid={Boolean(errors.password)}
                            hint={errors.password}
                        />

                        <PasswordInput
                            name="password_confirmation"
                            label="Conferma password"
                            isRequired
                            autoComplete="new-password"
                            placeholder="••••••••"
                            passwordrules={passwordRules}
                            isInvalid={Boolean(errors.password_confirmation)}
                            hint={errors.password_confirmation}
                        />
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        isDisabled={processing}
                        isLoading={processing}
                        data-test="register-user-button"
                    >
                        Crea account
                    </Button>

                    <p className="text-center text-sm text-tertiary">
                        Hai già un account?{' '}
                        <TextLink href={login()}>Accedi</TextLink>
                    </p>
                </>
            )}
        </Form>
    </>
);

Register.layout = {
    title: 'Crea un account',
    description: 'Inserisci i tuoi dati per creare il tuo account',
};

export default Register;
