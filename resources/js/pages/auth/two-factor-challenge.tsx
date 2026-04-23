import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';

import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { PinInput } from '@/components/base/input/pin-input';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo(() => {
        if (showRecoveryInput)
            return {
                title: 'Recovery Code',
                description:
                    'Please confirm access to your account by entering one of your emergency recovery codes.',
                toggleText: 'login using an authentication code',
            };
        return {
            title: 'Authentication Code',
            description:
                'Enter the authentication code provided by your authenticator application.',
            toggleText: 'login using a recovery code',
        };
    }, [showRecoveryInput]);

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title="Two-Factor Authentication" />
            <div className="space-y-6">
                <Form
                    {...store.form()}
                    className="space-y-4"
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <Input
                                    name="recovery_code"
                                    type="text"
                                    placeholder="Enter recovery code"
                                    autoFocus={showRecoveryInput}
                                    isRequired
                                    isInvalid={!!errors.recovery_code}
                                    hint={errors.recovery_code}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                    <div className="flex w-full items-center justify-center">
                                        <PinInput size="md">
                                            <PinInput.Group
                                                name="code"
                                                maxLength={OTP_MAX_LENGTH}
                                                value={code}
                                                onChange={(value: string) =>
                                                    setCode(value)
                                                }
                                                disabled={processing}
                                                pattern={REGEXP_ONLY_DIGITS}
                                            >
                                                {Array.from(
                                                    { length: OTP_MAX_LENGTH },
                                                    (_, index) => (
                                                        <PinInput.Slot
                                                            key={index}
                                                            index={index}
                                                        />
                                                    ),
                                                )}
                                            </PinInput.Group>
                                        </PinInput>
                                    </div>
                                    {errors.code && (
                                        <p className="text-error-600 dark:text-error-400 text-sm">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>
                            )}
                            <Button
                                type="submit"
                                className="w-full"
                                isDisabled={processing}
                                isLoading={processing}
                            >
                                Continue
                            </Button>
                            <div className="text-center text-sm text-text-tertiary">
                                <span>or you can </span>
                                <button
                                    type="button"
                                    className="cursor-pointer text-text-primary underline decoration-gray-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-gray-600"
                                    onClick={() =>
                                        toggleRecoveryMode(clearErrors)
                                    }
                                >
                                    {authConfigContent.toggleText}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
