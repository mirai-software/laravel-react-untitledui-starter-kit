import { Form } from '@inertiajs/react';
import { ShieldTick } from '@untitledui/icons';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import Heading from '@/components/heading';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';

export type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

const ManageTwoFactor = (props: Props) => {
    const requiresConfirmation = props.requiresConfirmation ?? false;
    const twoFactorEnabled = props.twoFactorEnabled ?? false;

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

    if (!(props.canManageTwoFactor ?? false)) {
        return null;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
                <Heading
                    variant="small"
                    title="Autenticazione a due fattori"
                    description="Gestisci le impostazioni di autenticazione a due fattori"
                />
                {twoFactorEnabled && (
                    <Badge type="pill-color" color="success" size="sm">
                        Attiva
                    </Badge>
                )}
            </div>

            {twoFactorEnabled ? (
                <div className="flex flex-col items-start gap-4">
                    <p className="text-sm text-tertiary">
                        All'accesso ti verrà chiesto un codice sicuro e casuale,
                        che puoi ottenere dall'app di autenticazione
                        (compatibile con TOTP) sul tuo telefono.
                    </p>

                    <Form {...disable.form()}>
                        {({ processing }) => (
                            <Button
                                type="submit"
                                color="primary-destructive"
                                isDisabled={processing}
                                isLoading={processing}
                            >
                                Disattiva 2FA
                            </Button>
                        )}
                    </Form>

                    <TwoFactorRecoveryCodes
                        recoveryCodesList={recoveryCodesList}
                        fetchRecoveryCodes={fetchRecoveryCodes}
                        errors={errors}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-start gap-4">
                    <p className="text-sm text-tertiary">
                        Con l'autenticazione a due fattori attiva, all'accesso
                        ti verrà chiesto anche un codice sicuro, che puoi
                        ottenere da un'app di autenticazione (compatibile con
                        TOTP) sul tuo telefono.
                    </p>

                    {hasSetupData ? (
                        <Button
                            iconLeading={ShieldTick}
                            onPress={() => setShowSetupModal(true)}
                        >
                            Continua la configurazione
                        </Button>
                    ) : (
                        <Form
                            {...enable.form()}
                            onSuccess={() => setShowSetupModal(true)}
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    isDisabled={processing}
                                    isLoading={processing}
                                >
                                    Attiva 2FA
                                </Button>
                            )}
                        </Form>
                    )}
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
    );
};

export default ManageTwoFactor;
