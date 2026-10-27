import { Form } from '@inertiajs/react';
import { Eye, EyeOff, Lock01, RefreshCw01 } from '@untitledui/icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import AlertError from '@/components/alert-error';
import { Button } from '@/components/base/buttons/button';
import { regenerateRecoveryCodes } from '@/routes/two-factor';
import { cx } from '@/utils/cx';

type TwoFactorRecoveryCodesProps = {
    recoveryCodesList: string[];
    fetchRecoveryCodes: () => Promise<void>;
    errors: string[];
};

const TwoFactorRecoveryCodes = ({
    recoveryCodesList,
    fetchRecoveryCodes,
    errors,
}: TwoFactorRecoveryCodesProps) => {
    const [codesAreVisible, setCodesAreVisible] = useState<boolean>(false);
    const codesSectionRef = useRef<HTMLDivElement | null>(null);
    const canRegenerateCodes = recoveryCodesList.length > 0 && codesAreVisible;

    const toggleCodesVisibility = useCallback(async () => {
        if (!codesAreVisible && !recoveryCodesList.length) {
            await fetchRecoveryCodes();
        }

        setCodesAreVisible(!codesAreVisible);

        if (!codesAreVisible) {
            setTimeout(() => {
                codesSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            });
        }
    }, [codesAreVisible, recoveryCodesList.length, fetchRecoveryCodes]);

    useEffect(() => {
        if (!recoveryCodesList.length) {
            void fetchRecoveryCodes();
        }
    }, [recoveryCodesList.length, fetchRecoveryCodes]);

    return (
        <div className="flex w-full flex-col gap-5 rounded-xl bg-primary p-5 shadow-xs ring-1 ring-secondary ring-inset">
            <div className="flex flex-col gap-1">
                <h3 className="flex items-center gap-2 text-md font-semibold text-primary">
                    <Lock01
                        className="size-4 text-fg-quaternary"
                        aria-hidden="true"
                    />
                    Codici di recupero 2FA
                </h3>
                <p className="text-sm text-tertiary">
                    I codici di recupero ti permettono di riottenere l'accesso
                    se perdi il dispositivo per la 2FA. Conservali in un gestore
                    di password sicuro.
                </p>
            </div>

            <div className="flex flex-col gap-3 select-none sm:flex-row sm:items-center sm:justify-between">
                <Button
                    color="secondary"
                    iconLeading={codesAreVisible ? EyeOff : Eye}
                    onPress={() => {
                        void toggleCodesVisibility();
                    }}
                    aria-expanded={codesAreVisible}
                    aria-controls="recovery-codes-section"
                    className="w-fit"
                >
                    {codesAreVisible ? 'Nascondi' : 'Mostra'} codici di recupero
                </Button>

                {canRegenerateCodes && (
                    <Form
                        {...regenerateRecoveryCodes.form()}
                        options={{ preserveScroll: true }}
                        onSuccess={() => {
                            void fetchRecoveryCodes();
                        }}
                    >
                        {({ processing }) => (
                            <Button
                                type="submit"
                                color="secondary"
                                iconLeading={RefreshCw01}
                                isDisabled={processing}
                                isLoading={processing}
                                aria-describedby="regenerate-warning"
                            >
                                Rigenera codici
                            </Button>
                        )}
                    </Form>
                )}
            </div>

            <div
                id="recovery-codes-section"
                className={cx(
                    'relative overflow-hidden transition-all duration-300',
                    codesAreVisible ? 'h-auto opacity-100' : 'h-0 opacity-0',
                )}
                aria-hidden={!codesAreVisible}
            >
                <div className="flex flex-col gap-3">
                    {errors.length ? (
                        <AlertError errors={errors} />
                    ) : (
                        <>
                            <div
                                ref={codesSectionRef}
                                className="grid gap-1 rounded-lg bg-secondary p-4 font-mono text-sm text-primary"
                                role="list"
                                aria-label="Codici di recupero"
                            >
                                {recoveryCodesList.length ? (
                                    recoveryCodesList.map((code) => (
                                        <div
                                            key={code}
                                            role="listitem"
                                            className="select-text"
                                        >
                                            {code}
                                        </div>
                                    ))
                                ) : (
                                    <div
                                        className="flex flex-col gap-2"
                                        aria-label="Caricamento dei codici di recupero"
                                    >
                                        {Array.from(
                                            { length: 8 },
                                            (_, index) => (
                                                <div
                                                    key={index}
                                                    className="h-4 animate-pulse rounded bg-quaternary"
                                                    aria-hidden="true"
                                                />
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>

                            <p
                                id="regenerate-warning"
                                className="text-xs text-tertiary select-none"
                            >
                                Ogni codice di recupero può essere usato una
                                sola volta per accedere al tuo account e viene
                                poi rimosso. Se te ne servono altri, usa{' '}
                                <span className="font-semibold">
                                    Rigenera codici
                                </span>{' '}
                                qui sopra.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TwoFactorRecoveryCodes;
