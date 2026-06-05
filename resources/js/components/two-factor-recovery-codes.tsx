import { Form } from '@inertiajs/react';
import { Eye, EyeOff, Lock01, RefreshCw01 } from '@untitledui/icons';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/base/buttons/button';
import { regenerateRecoveryCodes } from '@/routes/two-factor';

import AlertError from './alert-error';

type Props = {
    recoveryCodesList: string[];
    fetchRecoveryCodes: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorRecoveryCodes({
    recoveryCodesList,
    fetchRecoveryCodes,
    errors,
}: Props) {
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
            fetchRecoveryCodes();
        }
    }, [recoveryCodesList.length, fetchRecoveryCodes]);

    const RecoveryCodeIconComponent = codesAreVisible ? EyeOff : Eye;

    return (
        <div className="rounded-lg border border-border-secondary bg-bg-primary">
            <div className="px-4 py-4 sm:px-6">
                <h3 className="flex items-center gap-3 text-base font-semibold text-text-primary">
                    <Lock01 className="size-4" aria-hidden="true" />
                    Codici di recupero 2FA
                </h3>
                <p className="mt-1 text-sm text-text-tertiary">
                    I codici di recupero ti permettono di riottenere l'accesso
                    se perdi il dispositivo 2FA. Conservali in un gestore di
                    password sicuro.
                </p>
            </div>
            <div className="px-4 pb-4 sm:px-6">
                <div className="flex flex-col gap-3 select-none sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        onClick={toggleCodesVisibility}
                        iconLeading={RecoveryCodeIconComponent}
                        aria-expanded={codesAreVisible}
                        aria-controls="recovery-codes-section"
                    >
                        {codesAreVisible ? 'Nascondi' : 'Mostra'} codici di
                        recupero
                    </Button>

                    {canRegenerateCodes && (
                        <Form
                            {...regenerateRecoveryCodes.form()}
                            options={{ preserveScroll: true }}
                            onSuccess={fetchRecoveryCodes}
                        >
                            {({ processing }) => (
                                <Button
                                    color="secondary"
                                    type="submit"
                                    isDisabled={processing}
                                    iconLeading={RefreshCw01}
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
                    className={`relative overflow-hidden transition-all duration-300 ${codesAreVisible ? 'h-auto opacity-100' : 'h-0 opacity-0'}`}
                    aria-hidden={!codesAreVisible}
                >
                    <div className="mt-3 space-y-3">
                        {errors?.length ? (
                            <AlertError errors={errors} />
                        ) : (
                            <>
                                <div
                                    ref={codesSectionRef}
                                    className="grid gap-1 rounded-lg bg-bg-secondary p-4 font-mono text-sm"
                                    role="list"
                                    aria-label="Codici di recupero"
                                >
                                    {recoveryCodesList.length ? (
                                        recoveryCodesList.map((code, index) => (
                                            <div
                                                key={index}
                                                role="listitem"
                                                className="select-text"
                                            >
                                                {code}
                                            </div>
                                        ))
                                    ) : (
                                        <div aria-label="Caricamento codici di recupero">
                                            {Array.from(
                                                { length: 8 },
                                                (_, index) => (
                                                    <div
                                                        key={index}
                                                        className="h-4 animate-pulse rounded bg-bg-tertiary"
                                                        aria-hidden="true"
                                                    />
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="text-xs text-text-tertiary select-none">
                                    <p id="regenerate-warning">
                                        Ogni codice di recupero può essere usato
                                        una sola volta per accedere al tuo
                                        account e verrà rimosso dopo l'uso. Se
                                        te ne servono altri, clicca{' '}
                                        <span className="font-bold">
                                            Rigenera codici
                                        </span>{' '}
                                        qui sopra.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
