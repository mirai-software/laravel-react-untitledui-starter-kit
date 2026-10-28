import { usePasskeyRegister } from '@laravel/passkeys/react';
import { Plus } from '@untitledui/icons';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import InputError from '@/components/input-error';
import { passkeyErrorMessage } from '@/lib/passkey-errors';

type PasskeyRegistrationProps = {
    onSuccess: () => void;
};

/** A default name like "Chrome su Mac", guessed from the user agent. */
const guessPasskeyName = (): string => {
    if (typeof navigator === 'undefined') {
        return '';
    }

    const ua = navigator.userAgent;

    const browser = [
        { pattern: /Edg|Edge/, name: 'Edge' },
        { pattern: /OPR|Opera|OPiOS/, name: 'Opera' },
        { pattern: /Firefox|FxiOS/, name: 'Firefox' },
        { pattern: /Chrome|CriOS/, name: 'Chrome' },
        { pattern: /Safari/, name: 'Safari' },
    ].find(({ pattern }) => pattern.test(ua))?.name;

    const os = [
        { pattern: /iPhone/, name: 'iPhone' },
        { pattern: /iPad|Macintosh(?=.*Mobile)/, name: 'iPad' },
        { pattern: /Android/, name: 'Android' },
        { pattern: /Mac/, name: 'Mac' },
        { pattern: /Windows/, name: 'Windows' },
    ].find(({ pattern }) => pattern.test(ua))?.name;

    return [browser, os].filter(Boolean).join(' su ');
};

const PasskeyRegistration = ({ onSuccess }: PasskeyRegistrationProps) => {
    const [name, setName] = useState(guessPasskeyName);
    const [showForm, setShowForm] = useState(false);
    const { register, isLoading, errorInstance, isSupported } =
        usePasskeyRegister({
            onSuccess: () => {
                setName('');
                setShowForm(false);
                onSuccess();
            },
        });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!name.trim()) {
            return;
        }

        await register(name);
    };

    const handleCancel = () => {
        setShowForm(false);
        setName('');
    };

    if (!isSupported) {
        return (
            <p className="text-sm text-tertiary">
                Le passkey non sono supportate da questo browser.
            </p>
        );
    }

    if (!showForm) {
        return (
            <div>
                <Button
                    color="secondary"
                    iconLeading={Plus}
                    onPress={() => setShowForm(true)}
                >
                    Aggiungi passkey
                </Button>
            </div>
        );
    }

    return (
        <form
            onSubmit={(event) => {
                void handleSubmit(event);
            }}
            className="flex flex-col gap-4 rounded-xl bg-secondary p-4"
        >
            <Input
                label="Nome della passkey"
                value={name}
                onChange={setName}
                placeholder="es. MacBook Pro, iPhone"
                hint="Un nome ti aiuta a riconoscere la passkey in seguito."
                autoFocus
            />

            <InputError message={passkeyErrorMessage(errorInstance)} />

            <div className="flex gap-3">
                <Button
                    type="submit"
                    isDisabled={isLoading || !name.trim()}
                    isLoading={isLoading}
                >
                    Registra passkey
                </Button>
                <Button color="tertiary" onPress={handleCancel}>
                    Annulla
                </Button>
            </div>
        </form>
    );
};

export default PasskeyRegistration;
