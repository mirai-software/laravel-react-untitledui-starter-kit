import { Form, Head } from '@inertiajs/react';

import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { update } from '@/routes/password';

type Props = { token: string; email: string };

export default function ResetPassword({ token, email }: Props) {
    return (
        <>
            <Head title="Reset password" />
            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <Input
                            name="email"
                            type="email"
                            label="Email"
                            autoComplete="email"
                            value={email}
                            isDisabled
                            isInvalid={!!errors.email}
                            hint={errors.email}
                        />
                        <Input
                            name="password"
                            type="password"
                            label="Password"
                            autoComplete="new-password"
                            autoFocus
                            placeholder="Password"
                            isInvalid={!!errors.password}
                            hint={errors.password}
                        />
                        <Input
                            name="password_confirmation"
                            type="password"
                            label="Confirm password"
                            autoComplete="new-password"
                            placeholder="Confirm password"
                            isInvalid={!!errors.password_confirmation}
                            hint={errors.password_confirmation}
                        />
                        <Button
                            type="submit"
                            className="mt-4 w-full"
                            isDisabled={processing}
                            isLoading={processing}
                            data-test="reset-password-button"
                        >
                            Reset password
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Reset password',
    description: 'Please enter your new password below',
};
