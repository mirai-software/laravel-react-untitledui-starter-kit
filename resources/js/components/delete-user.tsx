import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import { Heading as AriaHeading } from 'react-aria-components';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import Heading from '@/components/heading';
import PasswordInput from '@/components/password-input';

const DeleteUser = () => {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col gap-6">
            <Heading
                variant="small"
                title="Elimina account"
                description="Elimina il tuo account e tutti i suoi dati"
            />

            <div className="flex flex-col items-start gap-4 rounded-xl bg-error-primary p-4 ring-1 ring-error_subtle ring-inset">
                <div className="flex flex-col gap-0.5 text-sm text-error-primary">
                    <p className="font-semibold">Attenzione</p>
                    <p>
                        Procedi con cautela: l'operazione non si può annullare.
                    </p>
                </div>

                <DialogTrigger>
                    <Button
                        color="primary-destructive"
                        data-test="delete-user-button"
                    >
                        Elimina account
                    </Button>

                    <ModalOverlay isDismissable>
                        <Modal className="max-w-md">
                            <Dialog>
                                {({ close }) => (
                                    <div className="flex flex-col gap-6 p-6">
                                        <div className="flex flex-col gap-1">
                                            <AriaHeading
                                                slot="title"
                                                className="text-lg font-semibold text-primary"
                                            >
                                                Vuoi davvero eliminare il tuo
                                                account?
                                            </AriaHeading>
                                            <p className="text-sm text-tertiary">
                                                Una volta eliminato l'account,
                                                tutti i suoi dati verranno
                                                cancellati definitivamente.
                                                Inserisci la password per
                                                confermare.
                                            </p>
                                        </div>

                                        <Form
                                            {...ProfileController.destroy.form()}
                                            options={{
                                                preserveScroll: true,
                                            }}
                                            onError={() =>
                                                passwordInput.current?.focus()
                                            }
                                            resetOnSuccess
                                            className="flex flex-col gap-6"
                                        >
                                            {({
                                                resetAndClearErrors,
                                                processing,
                                                errors,
                                            }) => (
                                                <>
                                                    <PasswordInput
                                                        ref={passwordInput}
                                                        name="password"
                                                        label="Password"
                                                        autoComplete="current-password"
                                                        placeholder="••••••••"
                                                        autoFocus
                                                        isInvalid={Boolean(
                                                            errors.password,
                                                        )}
                                                        hint={errors.password}
                                                    />

                                                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                                        <Button
                                                            color="secondary"
                                                            onPress={() => {
                                                                resetAndClearErrors();
                                                                close();
                                                            }}
                                                        >
                                                            Annulla
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            color="primary-destructive"
                                                            isDisabled={
                                                                processing
                                                            }
                                                            isLoading={
                                                                processing
                                                            }
                                                            data-test="confirm-delete-user-button"
                                                        >
                                                            Elimina account
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </Form>
                                    </div>
                                )}
                            </Dialog>
                        </Modal>
                    </ModalOverlay>
                </DialogTrigger>
            </div>
        </div>
    );
};

export default DeleteUser;
