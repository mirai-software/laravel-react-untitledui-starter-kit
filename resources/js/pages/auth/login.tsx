import { Form, Head } from '@inertiajs/react';

import { Button } from '@/components/base/buttons/button';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Input } from '@/components/base/input/input';
import { Label } from '@/components/base/input/label';
import TextLink from '@/components/text-link';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <Input
                                name="email"
                                type="email"
                                label="Email address"
                                isRequired
                                autoFocus
                                autoComplete="email"
                                placeholder="email@example.com"
                                isInvalid={!!errors.email}
                                hint={errors.email}
                            />

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label>Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    name="password"
                                    type="password"
                                    isRequired
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    isInvalid={!!errors.password}
                                    hint={errors.password}
                                />
                            </div>

                            <Checkbox name="remember" label="Remember me" />

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                isDisabled={processing}
                                isLoading={processing}
                                data-test="login-button"
                            >
                                Log in
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm text-text-tertiary">
                                Don't have an account?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="text-success-600 mb-4 text-center text-sm font-medium">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
