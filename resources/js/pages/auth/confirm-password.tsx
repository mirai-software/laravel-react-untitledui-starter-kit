import { Form, Head } from '@inertiajs/react';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import { Button } from '@/components/base/buttons/button';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { store } from '@/routes/password/confirm';

const ConfirmPassword = () => (
    <>
        <Head title="Conferma password" />

        <PasskeyVerify
            routes={{
                options: confirmOptions(),
                submit: confirmStore(),
            }}
            label="Conferma con una passkey"
            loadingLabel="Conferma in corso…"
            separator="Oppure conferma con la password"
        />

        <Form
            {...store.form()}
            resetOnSuccess={['password']}
            className="flex flex-col gap-6"
        >
            {({ processing, errors }) => (
                <>
                    <PasswordInput
                        name="password"
                        label="Password"
                        autoFocus
                        autoComplete="current-password"
                        placeholder="••••••••"
                        isInvalid={Boolean(errors.password)}
                        hint={errors.password}
                    />

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        isDisabled={processing}
                        isLoading={processing}
                        data-test="confirm-password-button"
                    >
                        Conferma password
                    </Button>
                </>
            )}
        </Form>
    </>
);

ConfirmPassword.layout = {
    title: 'Conferma la tua password',
    description:
        "Questa è un'area protetta dell'applicazione. Conferma la tua password per continuare.",
};

export default ConfirmPassword;
