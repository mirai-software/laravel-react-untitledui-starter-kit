import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { PinInput } from '@/components/base/input/pin-input';
import InputError from '@/components/input-error';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

const TwoFactorChallenge = () => {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Codice di recupero',
                description:
                    "Conferma l'accesso al tuo account inserendo uno dei tuoi codici di recupero di emergenza.",
                toggleText: 'accedi con un codice di autenticazione',
            };
        }

        return {
            title: 'Codice di autenticazione',
            description:
                'Inserisci il codice di autenticazione fornito dalla tua app di autenticazione.',
            toggleText: 'accedi con un codice di recupero',
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
            <Head title="Autenticazione a due fattori" />

            <Form
                {...store.form()}
                className="flex flex-col gap-6"
                // Inertia's `resetOnError` can't clear the PIN input (its value is React state).
                onError={() => setCode('')}
            >
                {({ errors, processing, clearErrors }) => (
                    <>
                        {showRecoveryInput ? (
                            <Input
                                name="recovery_code"
                                label="Codice di recupero"
                                placeholder="Inserisci il codice di recupero"
                                autoFocus
                                isRequired
                                isInvalid={Boolean(errors.recovery_code)}
                                hint={errors.recovery_code}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <PinInput
                                    size="xs"
                                    disabled={processing}
                                    invalid={Boolean(errors.code)}
                                >
                                    <PinInput.Group
                                        name="code"
                                        maxLength={OTP_MAX_LENGTH}
                                        value={code}
                                        onChange={(value: string) =>
                                            setCode(value)
                                        }
                                        pattern={REGEXP_ONLY_DIGITS}
                                        autoFocus
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
                                <InputError
                                    message={errors.code}
                                    className="text-center"
                                />
                            </div>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            isDisabled={processing}
                            isLoading={processing}
                        >
                            Continua
                        </Button>

                        <p className="text-center text-sm text-tertiary">
                            oppure puoi{' '}
                            <Button
                                color="link-color"
                                onPress={() => toggleRecoveryMode(clearErrors)}
                            >
                                {authConfigContent.toggleText}
                            </Button>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
};

export default TwoFactorChallenge;
