import type { UrlMethodPair } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { Key01 } from '@untitledui/icons';
import { Button } from '@/components/base/buttons/button';
import InputError from '@/components/input-error';

type PasskeyVerifyProps = {
    routes?: {
        options: UrlMethodPair;
        submit: UrlMethodPair;
    };
    label?: string;
    loadingLabel?: string;
    separator?: string;
};

const PasskeyVerify = ({
    routes,
    label = 'Accedi con una passkey',
    loadingLabel = 'Autenticazione in corso…',
    separator = "Oppure continua con l'email",
}: PasskeyVerifyProps = {}) => {
    const { verify, isLoading, error, isSupported } = usePasskeyVerify({
        ...(routes && {
            routes: {
                options: routes.options.url,
                submit: routes.submit.url,
            },
        }),
        onSuccess: (response) => {
            router.visit(response.redirect ?? '/dashboard');
        },
    });

    if (!isSupported) {
        return null;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <Button
                    type="button"
                    color="secondary"
                    size="lg"
                    className="w-full"
                    iconLeading={Key01}
                    onPress={() => {
                        void verify();
                    }}
                    isDisabled={isLoading}
                    isLoading={isLoading}
                    showTextWhileLoading
                >
                    {isLoading ? loadingLabel : label}
                </Button>
                <InputError message={error} className="text-center" />
            </div>

            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border-secondary" />
                <span className="text-sm text-tertiary">{separator}</span>
                <div className="h-px flex-1 bg-border-secondary" />
            </div>
        </div>
    );
};

export default PasskeyVerify;
