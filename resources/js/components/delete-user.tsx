import { Form } from '@inertiajs/react';
import { useRef } from 'react';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import Heading from '@/components/heading';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Elimina account"
                description="Disattiva il tuo account e revoca l'accesso"
            />
            <div className="border-error-300/30 bg-error-25 dark:border-error-500/20 dark:bg-error-950 space-y-4 rounded-lg border p-4">
                <div className="text-error-600 dark:text-error-300 relative space-y-0.5">
                    <p className="font-medium">Attenzione</p>
                    <p className="text-sm">
                        Procedi con cautela: l'account verrà disattivato e
                        perderai l'accesso.
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
                        <Modal>
                            <Dialog>
                                {({ close }) => (
                                    <>
                                        <h2 className="text-lg font-semibold text-text-primary">
                                            Vuoi davvero eliminare il tuo
                                            account?
                                        </h2>
                                        <p className="mt-2 text-sm text-text-tertiary">
                                            Una volta eliminato, il tuo account
                                            verrà disattivato e perderai
                                            l'accesso. Inserisci la password per
                                            confermare.
                                        </p>

                                        <Form
                                            {...ProfileController.destroy.form()}
                                            options={{
                                                preserveScroll: true,
                                            }}
                                            onError={() =>
                                                passwordInput.current?.focus()
                                            }
                                            resetOnSuccess
                                            className="mt-4 space-y-6"
                                        >
                                            {({
                                                resetAndClearErrors,
                                                processing,
                                                errors,
                                            }) => (
                                                <>
                                                    <Input
                                                        type="password"
                                                        name="password"
                                                        ref={passwordInput}
                                                        placeholder="Password"
                                                        autoComplete="current-password"
                                                        isInvalid={
                                                            !!errors.password
                                                        }
                                                        hint={errors.password}
                                                    />

                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            color="secondary"
                                                            onClick={() => {
                                                                resetAndClearErrors();
                                                                close();
                                                            }}
                                                        >
                                                            Annulla
                                                        </Button>
                                                        <Button
                                                            color="primary-destructive"
                                                            type="submit"
                                                            isDisabled={
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
                                    </>
                                )}
                            </Dialog>
                        </Modal>
                    </ModalOverlay>
                </DialogTrigger>
            </div>
        </div>
    );
}
