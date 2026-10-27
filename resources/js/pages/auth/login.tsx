import { Form, Head } from '@inertiajs/react';
import { Button } from '@/components/base/buttons/button';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Input } from '@/components/base/input/input';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type LoginProps = {
    status?: string;
    canResetPassword: boolean;
};

const Login = ({ status, canResetPassword }: LoginProps) => (
    <>
        <Head title="Accedi" />

        <PasskeyVerify />

        <Form
            {...store.form()}
            resetOnSuccess={['password']}
            className="flex flex-col gap-6"
        >
            {({ processing, errors }) => (
                <>
                    <div className="flex flex-col gap-5">
                        <Input
                            name="email"
                            type="email"
                            label="Email"
                            isRequired
                            autoFocus
                            autoComplete="email"
                            placeholder="email@example.com"
                            isInvalid={Boolean(errors.email)}
                            hint={errors.email}
                        />

                        <PasswordInput
                            name="password"
                            label="Password"
                            isRequired
                            autoComplete="current-password"
                            placeholder="••••••••"
                            isInvalid={Boolean(errors.password)}
                            hint={errors.password}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <Checkbox name="remember" label="Ricordami" />

                        {canResetPassword && (
                            <TextLink href={request()} className="text-sm">
                                Password dimenticata?
                            </TextLink>
                        )}
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        isDisabled={processing}
                        isLoading={processing}
                        data-test="login-button"
                    >
                        Accedi
                    </Button>

                    <p className="text-center text-sm text-tertiary">
                        Non hai un account?{' '}
                        <TextLink href={register()}>Registrati</TextLink>
                    </p>
                </>
            )}
        </Form>

        {status && (
            <p className="text-center text-sm font-medium text-success-primary">
                {status}
            </p>
        )}
    </>
);

Login.layout = {
    title: 'Accedi al tuo account',
    description: 'Inserisci email e password per accedere',
};

export default Login;
