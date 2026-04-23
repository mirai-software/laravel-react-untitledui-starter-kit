import { Form, Head } from '@inertiajs/react';

import { Button } from '@/components/base/buttons/button';
import TextLink from '@/components/text-link';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />
            {status === 'verification-link-sent' && (
                <div className="text-success-600 mb-4 text-center text-sm font-medium">
                    A new verification link has been sent to the email address
                    you provided during registration.
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
                            Resend verification email
                        </Button>
                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            Log out
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verify email',
    description:
        'Please verify your email address by clicking on the link we just emailed to you.',
};
