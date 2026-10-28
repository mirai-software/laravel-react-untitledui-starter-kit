import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import { Button } from '@/components/base/buttons/button';
import Heading from '@/components/heading';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import { edit } from '@/routes/security';

// oxfmt-ignore
type SecurityProps = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

const Security = (props: SecurityProps) => {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    // Inertia's `resetOnError` / `resetOnSuccess` don't clear React Aria fields (React Aria ignores
    // Inertia's cancelled `reset` event); a native form reset does.
    const clearPasswordFields = (): void => {
        currentPasswordInput.current?.form?.reset();
    };

    return (
        <>
            <Head title="Impostazioni sicurezza" />

            <h1 className="sr-only">Impostazioni sicurezza</h1>

            <div className="flex flex-col gap-6">
                <Heading
                    variant="small"
                    title="Aggiorna password"
                    description="Usa una password lunga e casuale per tenere al sicuro il tuo account"
                />

                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    onSuccess={clearPasswordFields}
                    onError={(errors) => {
                        clearPasswordFields();

                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="flex flex-col gap-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <PasswordInput
                                ref={currentPasswordInput}
                                name="current_password"
                                label="Password attuale"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                isInvalid={Boolean(errors.current_password)}
                                hint={errors.current_password}
                            />

                            <PasswordInput
                                ref={passwordInput}
                                name="password"
                                label="Nuova password"
                                autoComplete="new-password"
                                placeholder="••••••••"
                                passwordrules={props.passwordRules}
                                isInvalid={Boolean(errors.password)}
                                hint={errors.password}
                            />

                            <PasswordInput
                                name="password_confirmation"
                                label="Conferma password"
                                autoComplete="new-password"
                                placeholder="••••••••"
                                passwordrules={props.passwordRules}
                                isInvalid={Boolean(
                                    errors.password_confirmation,
                                )}
                                hint={errors.password_confirmation}
                            />

                            <div>
                                <Button
                                    type="submit"
                                    isDisabled={processing}
                                    isLoading={processing}
                                    data-test="update-password-button"
                                >
                                    Salva password
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            <ManageTwoFactor
                canManageTwoFactor={props.canManageTwoFactor}
                requiresConfirmation={props.requiresConfirmation}
                twoFactorEnabled={props.twoFactorEnabled}
            />

            <ManagePasskeys
                canManagePasskeys={props.canManagePasskeys}
                passkeys={props.passkeys}
            />
        </>
    );
};

Security.layout = {
    breadcrumbs: [
        {
            title: 'Impostazioni sicurezza',
            href: edit(),
        },
    ],
};

export default Security;
