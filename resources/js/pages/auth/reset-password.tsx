import { Form, Head } from '@inertiajs/react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import PasswordInput from '@/components/password-input';
import { update } from '@/routes/password';

type ResetPasswordProps = {
    token: string;
    email: string;
    passwordRules: string;
};

const ResetPassword = ({ token, email, passwordRules }: ResetPasswordProps) => (
    <>
        <Head title="Reimposta password" />

        <Form
            {...update.form()}
            transform={(data) => ({ ...data, token, email })}
            resetOnSuccess={['password', 'password_confirmation']}
            className="flex flex-col gap-6"
        >
            {({ processing, errors }) => (
                <>
                    <div className="flex flex-col gap-5">
                        <Input
                            name="email"
                            type="email"
                            label="Email"
                            autoComplete="email"
                            value={email}
                            isReadOnly
                            isInvalid={Boolean(errors.email)}
                            hint={errors.email}
                        />

                        <PasswordInput
                            name="password"
                            label="Nuova password"
                            autoFocus
                            autoComplete="new-password"
                            placeholder="••••••••"
                            passwordrules={passwordRules}
                            isInvalid={Boolean(errors.password)}
                            hint={errors.password}
                        />

                        <PasswordInput
                            name="password_confirmation"
                            label="Conferma password"
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
                        data-test="reset-password-button"
                    >
                        Reimposta password
                    </Button>
                </>
            )}
        </Form>
    </>
);

ResetPassword.layout = {
    title: 'Reimposta password',
    description: 'Inserisci la tua nuova password',
};

export default ResetPassword;
