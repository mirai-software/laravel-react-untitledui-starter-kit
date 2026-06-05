import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { ShieldOff, ShieldTick } from '@untitledui/icons';
import { useEffect, useRef, useState } from 'react';

import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import Heading from '@/components/heading';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { edit } from '@/routes/security';
import { disable, enable } from '@/routes/two-factor';

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function Security({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    return (
        <>
            <Head title="Impostazioni sicurezza" />

            <h1 className="sr-only">Impostazioni sicurezza</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Aggiorna password"
                    description="Assicurati che il tuo account usi una password lunga e casuale per restare al sicuro"
                />

                <Form
                    {...SecurityController.update.form()}
                    options={{ preserveScroll: true }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) passwordInput.current?.focus();
                        if (errors.current_password)
                            currentPasswordInput.current?.focus();
                    }}
                    className="space-y-6"
                >
                    {({ errors, processing, recentlySuccessful }) => (
                        <>
                            <Input
                                ref={currentPasswordInput}
                                name="current_password"
                                type="password"
                                label="Password attuale"
                                autoComplete="current-password"
                                placeholder="Password attuale"
                                isInvalid={!!errors.current_password}
                                hint={errors.current_password}
                            />
                            <Input
                                ref={passwordInput}
                                name="password"
                                type="password"
                                label="Nuova password"
                                autoComplete="new-password"
                                placeholder="Nuova password"
                                isInvalid={!!errors.password}
                                hint={errors.password}
                            />
                            <Input
                                name="password_confirmation"
                                type="password"
                                label="Conferma password"
                                autoComplete="new-password"
                                placeholder="Conferma password"
                                isInvalid={!!errors.password_confirmation}
                                hint={errors.password_confirmation}
                            />
                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    isDisabled={processing}
                                    data-test="update-password-button"
                                >
                                    Salva password
                                </Button>
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-text-tertiary">
                                        Salvato
                                    </p>
                                </Transition>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            {canManageTwoFactor && (
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Autenticazione a due fattori"
                        description="Gestisci le impostazioni di autenticazione a due fattori"
                    />
                    {twoFactorEnabled ? (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge color="success">Attiva</Badge>
                            <p className="text-text-tertiary">
                                Con l'autenticazione a due fattori attiva, al
                                login ti verrà richiesto un pin sicuro e
                                casuale, che puoi ottenere dall'applicazione
                                compatibile con TOTP sul tuo telefono.
                            </p>
                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />
                            <div className="relative inline">
                                <Form {...disable.form()}>
                                    {({ processing }) => (
                                        <Button
                                            color="primary-destructive"
                                            type="submit"
                                            isDisabled={processing}
                                            iconLeading={ShieldOff}
                                        >
                                            Disattiva 2FA
                                        </Button>
                                    )}
                                </Form>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <Badge color="error">Disattivata</Badge>
                            <p className="text-text-tertiary">
                                Quando attivi l'autenticazione a due fattori, al
                                login ti verrà richiesto un pin sicuro. Questo
                                pin può essere ottenuto da un'applicazione
                                compatibile con TOTP sul tuo telefono.
                            </p>
                            <div>
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                        iconLeading={ShieldTick}
                                    >
                                        Continua configurazione
                                    </Button>
                                ) : (
                                    <Form
                                        {...enable.form()}
                                        onSuccess={() =>
                                            setShowSetupModal(true)
                                        }
                                    >
                                        {({ processing }) => (
                                            <Button
                                                type="submit"
                                                isDisabled={processing}
                                                iconLeading={ShieldTick}
                                            >
                                                Attiva 2FA
                                            </Button>
                                        )}
                                    </Form>
                                )}
                            </div>
                        </div>
                    )}
                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </div>
            )}
        </>
    );
}

Security.layout = {
    breadcrumbs: [{ title: 'Impostazioni sicurezza', href: edit() }],
};
