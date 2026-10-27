import { Key01, Trash01 } from '@untitledui/icons';
import { useState } from 'react';
import { Heading as AriaHeading } from 'react-aria-components';
import {
    Dialog,
    DialogTrigger,
    Modal,
    ModalOverlay,
} from '@/components/application/modals/modal';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import type { Passkey } from '@/types/auth';

type PasskeyItemProps = {
    passkey: Passkey;
    onDelete: (id: number, onError: () => void) => void;
};

const PasskeyItem = ({ passkey, onDelete }: PasskeyItemProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        onDelete(passkey.id, () => setIsDeleting(false));
    };

    return (
        <div className="flex items-center justify-between gap-4 p-4">
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary shadow-xs ring-1 ring-primary ring-inset">
                    <Key01 className="size-5 text-fg-secondary" />
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-primary">
                            {passkey.name}
                        </p>
                        {passkey.authenticator && (
                            <Badge type="color" color="gray" size="sm">
                                {passkey.authenticator}
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-tertiary">
                        Aggiunta {passkey.created_at_diff}
                        {passkey.last_used_at_diff && (
                            <>
                                <span className="mx-1 text-quaternary">·</span>
                                Ultimo utilizzo {passkey.last_used_at_diff}
                            </>
                        )}
                    </p>
                </div>
            </div>

            <DialogTrigger>
                <Button
                    color="tertiary-destructive"
                    size="sm"
                    iconLeading={Trash01}
                    aria-label={`Rimuovi la passkey ${passkey.name}`}
                />

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
                                            Rimuovi passkey
                                        </AriaHeading>
                                        <p className="text-sm text-tertiary">
                                            Vuoi davvero rimuovere la passkey "
                                            {passkey.name}"? Non potrai più
                                            usarla per accedere.
                                        </p>
                                    </div>
                                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                        <Button
                                            color="secondary"
                                            onPress={close}
                                        >
                                            Annulla
                                        </Button>
                                        <Button
                                            color="primary-destructive"
                                            onPress={handleDelete}
                                            isDisabled={isDeleting}
                                            isLoading={isDeleting}
                                        >
                                            Rimuovi passkey
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            </DialogTrigger>
        </div>
    );
};

export default PasskeyItem;
