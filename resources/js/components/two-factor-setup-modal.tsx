import { Form } from '@inertiajs/react';
import { Check, Copy01, QrCode02 } from '@untitledui/icons';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Heading as AriaHeading } from 'react-aria-components';
import AlertError from '@/components/alert-error';
import {
    Dialog,
    Modal,
    ModalOverlay,
} from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import { PinInput } from '@/components/base/input/pin-input';
import InputError from '@/components/input-error';
import { useAppearance } from '@/hooks/use-appearance';
import { useClipboard } from '@/hooks/use-clipboard';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { confirm } from '@/routes/two-factor';

type TwoFactorSetupStepProps = {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    buttonText: string;
    onNextStep: () => void;
    errors: string[];
};

const TwoFactorSetupStep = ({
    qrCodeSvg,
    manualSetupKey,
    buttonText,
    onNextStep,
    errors,
}: TwoFactorSetupStepProps) => {
    const { resolvedAppearance } = useAppearance();
    const [copiedText, copy] = useClipboard();
    const isKeyCopied =
        manualSetupKey !== null && copiedText === manualSetupKey;

    if (errors.length) {
        return <AlertError errors={errors} />;
    }

    return (
        <>
            <div className="mx-auto aspect-square w-56 rounded-xl p-3 ring-1 ring-secondary ring-inset">
                {qrCodeSvg ? (
                    <div
                        className="aspect-square w-full rounded-lg bg-white p-2 [&_svg]:size-full"
                        dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                        style={{
                            filter:
                                resolvedAppearance === 'dark'
                                    ? 'invert(1) brightness(1.5)'
                                    : undefined,
                        }}
                    />
                ) : (
                    <div
                        className="size-full animate-pulse rounded-lg bg-secondary"
                        aria-label="Caricamento del codice QR"
                    />
                )}
            </div>

            <Button size="lg" className="w-full" onPress={onNextStep}>
                {buttonText}
            </Button>

            <div className="flex w-full items-center gap-3">
                <div className="h-px flex-1 bg-border-secondary" />
                <span className="text-sm text-tertiary">
                    oppure inserisci il codice manualmente
                </span>
                <div className="h-px flex-1 bg-border-secondary" />
            </div>

            <div className="flex w-full items-center gap-2 rounded-lg bg-primary py-1 pr-1 pl-3 shadow-xs ring-1 ring-primary ring-inset">
                {manualSetupKey ? (
                    <>
                        <input
                            type="text"
                            readOnly
                            value={manualSetupKey}
                            aria-label="Chiave di configurazione"
                            className="w-full min-w-0 bg-transparent font-mono text-sm text-primary outline-hidden"
                        />
                        <Button
                            color="tertiary"
                            size="sm"
                            iconLeading={isKeyCopied ? Check : Copy01}
                            aria-label="Copia la chiave"
                            onPress={() => {
                                void copy(manualSetupKey);
                            }}
                        />
                    </>
                ) : (
                    <div
                        className="my-1.5 h-5 w-full animate-pulse rounded bg-secondary"
                        aria-label="Caricamento della chiave"
                    />
                )}
            </div>
        </>
    );
};

type TwoFactorVerificationStepProps = {
    onClose: () => void;
    onBack: () => void;
};

const TwoFactorVerificationStep = ({
    onClose,
    onBack,
}: TwoFactorVerificationStepProps) => {
    const [code, setCode] = useState<string>('');
    const pinInputContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => {
            pinInputContainerRef.current?.querySelector('input')?.focus();
        }, 0);
    }, []);

    return (
        <Form
            {...confirm.form()}
            onSuccess={() => onClose()}
            // Inertia's `resetOnError` can't clear the PIN input (its value is React state).
            onError={() => setCode('')}
            className="w-full"
        >
            {({
                processing,
                errors,
            }: {
                processing: boolean;
                errors?: {
                    confirmTwoFactorAuthentication?: { code?: string };
                };
            }) => (
                <div
                    ref={pinInputContainerRef}
                    className="flex w-full flex-col gap-6"
                >
                    <div className="flex flex-col items-center gap-2">
                        <PinInput
                            size="xs"
                            disabled={processing}
                            invalid={Boolean(
                                errors?.confirmTwoFactorAuthentication?.code,
                            )}
                        >
                            <PinInput.Group
                                name="code"
                                maxLength={OTP_MAX_LENGTH}
                                value={code}
                                onChange={(value: string) => setCode(value)}
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
                            message={
                                errors?.confirmTwoFactorAuthentication?.code
                            }
                            className="text-center"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            color="secondary"
                            size="lg"
                            className="flex-1"
                            onPress={onBack}
                            isDisabled={processing}
                        >
                            Indietro
                        </Button>
                        <Button
                            type="submit"
                            size="lg"
                            className="flex-1"
                            isDisabled={
                                processing || code.length < OTP_MAX_LENGTH
                            }
                            isLoading={processing}
                        >
                            Conferma
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
};

type TwoFactorSetupModalProps = {
    isOpen: boolean;
    onClose: () => void;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    clearSetupData: () => void;
    fetchSetupData: () => Promise<void>;
    errors: string[];
};

const TwoFactorSetupModal = ({
    isOpen,
    onClose,
    requiresConfirmation,
    twoFactorEnabled,
    qrCodeSvg,
    manualSetupKey,
    clearSetupData,
    fetchSetupData,
    errors,
}: TwoFactorSetupModalProps) => {
    const [showVerificationStep, setShowVerificationStep] =
        useState<boolean>(false);

    const modalConfig = useMemo<{
        title: string;
        description: string;
        buttonText: string;
    }>(() => {
        if (twoFactorEnabled) {
            return {
                title: 'Autenticazione a due fattori attiva',
                description:
                    "L'autenticazione a due fattori è ora attiva. Scansiona il codice QR o inserisci la chiave di configurazione nella tua app di autenticazione.",
                buttonText: 'Chiudi',
            };
        }

        if (showVerificationStep) {
            return {
                title: 'Verifica il codice',
                description:
                    'Inserisci il codice a 6 cifre della tua app di autenticazione',
                buttonText: 'Continua',
            };
        }

        return {
            title: "Attiva l'autenticazione a due fattori",
            description:
                "Per completare l'attivazione, scansiona il codice QR o inserisci la chiave di configurazione nella tua app di autenticazione",
            buttonText: 'Continua',
        };
    }, [twoFactorEnabled, showVerificationStep]);

    const resetModalState = useCallback(() => {
        if (twoFactorEnabled) {
            clearSetupData();
        }

        setShowVerificationStep(false);
    }, [clearSetupData, twoFactorEnabled]);

    const handleClose = useCallback(() => {
        resetModalState();
        onClose();
    }, [onClose, resetModalState]);

    const handleModalNextStep = useCallback(() => {
        if (requiresConfirmation) {
            setShowVerificationStep(true);

            return;
        }

        clearSetupData();
        handleClose();
    }, [requiresConfirmation, clearSetupData, handleClose]);

    const fetchSetupDataRef = useRef(fetchSetupData);

    useEffect(() => {
        fetchSetupDataRef.current = fetchSetupData;
    }, [fetchSetupData]);

    useEffect(() => {
        if (isOpen && !qrCodeSvg) {
            void fetchSetupDataRef.current();
        }
    }, [isOpen, qrCodeSvg]);

    return (
        <ModalOverlay
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                }
            }}
            isDismissable
        >
            <Modal className="max-w-md">
                <Dialog>
                    <div className="flex flex-col items-center gap-6 p-6">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-primary shadow-xs ring-1 ring-primary ring-inset">
                                <QrCode02 className="size-6 text-fg-secondary" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <AriaHeading
                                    slot="title"
                                    className="text-lg font-semibold text-primary"
                                >
                                    {modalConfig.title}
                                </AriaHeading>
                                <p className="text-sm text-tertiary">
                                    {modalConfig.description}
                                </p>
                            </div>
                        </div>

                        {showVerificationStep ? (
                            <TwoFactorVerificationStep
                                onClose={handleClose}
                                onBack={() => setShowVerificationStep(false)}
                            />
                        ) : (
                            <TwoFactorSetupStep
                                qrCodeSvg={qrCodeSvg}
                                manualSetupKey={manualSetupKey}
                                buttonText={modalConfig.buttonText}
                                onNextStep={handleModalNextStep}
                                errors={errors}
                            />
                        )}
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};

export default TwoFactorSetupModal;
