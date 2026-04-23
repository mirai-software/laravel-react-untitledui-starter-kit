import { Form } from '@inertiajs/react';
import { Check, Copy01, Scan } from '@untitledui/icons';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    Dialog,
    Modal,
    ModalOverlay,
} from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import { PinInput } from '@/components/base/input/pin-input';
import { Spinner } from '@/components/spinner';
import { useAppearance } from '@/hooks/use-appearance';
import { useClipboard } from '@/hooks/use-clipboard';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { confirm } from '@/routes/two-factor';

import AlertError from './alert-error';

function GridScanIcon() {
    return (
        <div className="mb-3 rounded-full border border-border-secondary bg-bg-primary p-0.5 shadow-xs">
            <div className="relative overflow-hidden rounded-full border border-border-secondary bg-bg-secondary p-2.5">
                <div className="absolute inset-0 grid grid-cols-5 opacity-50">
                    {Array.from({ length: 5 }, (_, i) => (
                        <div
                            key={`col-${i + 1}`}
                            className="border-r border-border-secondary last:border-r-0"
                        />
                    ))}
                </div>
                <div className="absolute inset-0 grid grid-rows-5 opacity-50">
                    {Array.from({ length: 5 }, (_, i) => (
                        <div
                            key={`row-${i + 1}`}
                            className="border-b border-border-secondary last:border-b-0"
                        />
                    ))}
                </div>
                <Scan className="relative z-20 size-6 text-text-primary" />
            </div>
        </div>
    );
}

function TwoFactorSetupStep({
    qrCodeSvg,
    manualSetupKey,
    buttonText,
    onNextStep,
    errors,
}: {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    buttonText: string;
    onNextStep: () => void;
    errors: string[];
}) {
    const { resolvedAppearance } = useAppearance();
    const [copiedText, copy] = useClipboard();
    const IconComponent = copiedText === manualSetupKey ? Check : Copy01;

    return (
        <>
            {errors?.length ? (
                <AlertError errors={errors} />
            ) : (
                <>
                    <div className="mx-auto flex max-w-md overflow-hidden">
                        <div className="mx-auto aspect-square w-64 rounded-lg border border-border-secondary">
                            <div className="z-10 flex h-full w-full items-center justify-center p-5">
                                {qrCodeSvg ? (
                                    <div
                                        className="aspect-square w-full rounded-lg bg-white p-2 [&_svg]:size-full"
                                        dangerouslySetInnerHTML={{
                                            __html: qrCodeSvg,
                                        }}
                                        style={{
                                            filter:
                                                resolvedAppearance === 'dark'
                                                    ? 'invert(1) brightness(1.5)'
                                                    : undefined,
                                        }}
                                    />
                                ) : (
                                    <Spinner />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full space-x-5">
                        <Button className="w-full" onClick={onNextStep}>
                            {buttonText}
                        </Button>
                    </div>

                    <div className="relative flex w-full items-center justify-center">
                        <div className="absolute inset-0 top-1/2 h-px w-full bg-border-secondary" />
                        <span className="relative bg-bg-primary px-2 py-1 text-sm text-text-tertiary">
                            or, enter the code manually
                        </span>
                    </div>

                    <div className="flex w-full space-x-2">
                        <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-border-secondary">
                            {!manualSetupKey ? (
                                <div className="flex h-full w-full items-center justify-center bg-bg-secondary p-3">
                                    <Spinner />
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        readOnly
                                        value={manualSetupKey}
                                        className="h-full w-full bg-bg-primary p-3 text-text-primary outline-hidden"
                                    />
                                    <button
                                        onClick={() => copy(manualSetupKey)}
                                        className="border-l border-border-secondary px-3 hover:bg-bg-secondary"
                                    >
                                        <IconComponent className="w-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

function TwoFactorVerificationStep({
    onClose,
    onBack,
}: {
    onClose: () => void;
    onBack: () => void;
}) {
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
            resetOnError
            resetOnSuccess
        >
            {({
                processing,
                errors,
            }: {
                processing: boolean;
                errors?: { confirmTwoFactorAuthentication?: { code?: string } };
            }) => (
                <>
                    <div
                        ref={pinInputContainerRef}
                        className="relative w-full space-y-3"
                    >
                        <div className="flex w-full flex-col items-center space-y-3 py-2">
                            <PinInput size="md">
                                <PinInput.Group
                                    name="code"
                                    maxLength={OTP_MAX_LENGTH}
                                    onChange={setCode}
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
                            {errors?.confirmTwoFactorAuthentication?.code && (
                                <p className="text-error-600 dark:text-error-400 text-sm">
                                    {errors.confirmTwoFactorAuthentication.code}
                                </p>
                            )}
                        </div>

                        <div className="flex w-full space-x-5">
                            <Button
                                color="secondary"
                                type="button"
                                className="flex-1"
                                onClick={onBack}
                                isDisabled={processing}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                isDisabled={
                                    processing || code.length < OTP_MAX_LENGTH
                                }
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Form>
    );
}

type Props = {
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

export default function TwoFactorSetupModal({
    isOpen,
    onClose,
    requiresConfirmation,
    twoFactorEnabled,
    qrCodeSvg,
    manualSetupKey,
    clearSetupData,
    fetchSetupData,
    errors,
}: Props) {
    const [showVerificationStep, setShowVerificationStep] =
        useState<boolean>(false);

    const modalConfig = useMemo<{
        title: string;
        description: string;
        buttonText: string;
    }>(() => {
        if (twoFactorEnabled) {
            return {
                title: 'Two-Factor Authentication Enabled',
                description:
                    'Two-factor authentication is now enabled. Scan the QR code or enter the setup key in your authenticator app.',
                buttonText: 'Close',
            };
        }

        if (showVerificationStep) {
            return {
                title: 'Verify Authentication Code',
                description:
                    'Enter the 6-digit code from your authenticator app',
                buttonText: 'Continue',
            };
        }

        return {
            title: 'Enable Two-Factor Authentication',
            description:
                'To finish enabling two-factor authentication, scan the QR code or enter the setup key in your authenticator app',
            buttonText: 'Continue',
        };
    }, [twoFactorEnabled, showVerificationStep]);

    const handleModalNextStep = useCallback(() => {
        if (requiresConfirmation) {
            setShowVerificationStep(true);
            return;
        }

        clearSetupData();
        onClose();
    }, [requiresConfirmation, clearSetupData, onClose]);

    const resetModalState = useCallback(() => {
        setShowVerificationStep(false);

        if (twoFactorEnabled) {
            clearSetupData();
        }
    }, [twoFactorEnabled, clearSetupData]);

    useEffect(() => {
        if (isOpen && !qrCodeSvg) {
            fetchSetupData();
        }
    }, [isOpen, qrCodeSvg, fetchSetupData]);

    const handleClose = useCallback(() => {
        resetModalState();
        onClose();
    }, [onClose, resetModalState]);

    return (
        <ModalOverlay
            isOpen={isOpen}
            onOpenChange={(open) => !open && handleClose()}
            isDismissable
        >
            <Modal>
                <Dialog>
                    {() => (
                        <div className="sm:max-w-md">
                            <div className="flex flex-col items-center text-center">
                                <GridScanIcon />
                                <h2 className="text-lg font-semibold text-text-primary">
                                    {modalConfig.title}
                                </h2>
                                <p className="mt-1 text-sm text-text-tertiary">
                                    {modalConfig.description}
                                </p>
                            </div>

                            <div className="mt-5 flex flex-col items-center space-y-5">
                                {showVerificationStep ? (
                                    <TwoFactorVerificationStep
                                        onClose={onClose}
                                        onBack={() =>
                                            setShowVerificationStep(false)
                                        }
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
                        </div>
                    )}
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}
