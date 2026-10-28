import { Heading as AriaHeading } from 'react-aria-components';
import {
    Dialog,
    Modal,
    ModalOverlay,
} from '@/components/application/modals/modal';
import { Button } from '@/components/base/buttons/button';

type ConfirmModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    title: string;
    description: string;
    confirmLabel: string;
    isDestructive?: boolean;
    isProcessing?: boolean;
    onConfirm: () => void;
};

/**
 * Confirmation dialog for actions started from a list, e.g. deactivating a user.
 * It can't be dismissed while the action runs. Keep the title's subject set until the
 * dialog has closed, or the closing animation shows an empty name.
 */
const ConfirmModal = ({
    isOpen,
    onOpenChange,
    title,
    description,
    confirmLabel,
    isDestructive = false,
    isProcessing = false,
    onConfirm,
}: ConfirmModalProps) => (
    <ModalOverlay
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={!isProcessing}
        isKeyboardDismissDisabled={isProcessing}
    >
        <Modal className="max-w-md">
            <Dialog role={isDestructive ? 'alertdialog' : 'dialog'}>
                <div className="flex flex-col gap-6 p-6">
                    <div className="flex flex-col gap-1">
                        <AriaHeading
                            slot="title"
                            className="text-lg font-semibold text-primary"
                        >
                            {title}
                        </AriaHeading>
                        <p className="text-sm text-tertiary">{description}</p>
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button
                            color="secondary"
                            isDisabled={isProcessing}
                            onPress={() => onOpenChange(false)}
                        >
                            Annulla
                        </Button>
                        <Button
                            color={
                                isDestructive
                                    ? 'primary-destructive'
                                    : 'primary'
                            }
                            isDisabled={isProcessing}
                            isLoading={isProcessing}
                            onPress={onConfirm}
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </Modal>
    </ModalOverlay>
);

export { ConfirmModal };
