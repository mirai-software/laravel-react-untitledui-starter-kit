import { Form, Head } from '@inertiajs/react';

import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm password" />
            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <Input
                            name="password"
                            type="password"
                            label="Password"
                            placeholder="Password"
                            autoComplete="current-password"
                            autoFocus
                            isInvalid={!!errors.password}
                            hint={errors.password}
                        />
                        <div className="flex items-center">
                            <Button
                                className="w-full"
                                type="submit"
                                isDisabled={processing}
                                isLoading={processing}
                                data-test="confirm-password-button"
                            >
                                Confirm password
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Confirm your password',
    description:
        'This is a secure area of the application. Please confirm your password before continuing.',
};
