import { router } from '@inertiajs/react';
import { Key01 } from '@untitledui/icons';
import { destroy } from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyRegistrationController';
import Heading from '@/components/heading';
import PasskeyItem from '@/components/passkey-item';
import PasskeyRegistration from '@/components/passkey-register';
import type { Passkey } from '@/types/auth';

export type Props = {
    canManagePasskeys?: boolean;
    passkeys?: Passkey[];
};

const EmptyState = () => (
    <div className="flex flex-col items-center gap-3 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary shadow-xs ring-1 ring-primary ring-inset">
            <Key01 className="size-6 text-fg-secondary" />
        </div>
        <div className="flex flex-col gap-1">
            <p className="text-md font-semibold text-primary">
                Nessuna passkey
            </p>
            <p className="text-sm text-tertiary">
                Aggiungi una passkey per accedere senza password
            </p>
        </div>
    </div>
);

const ManagePasskeys = (props: Props) => {
    const passkeys = props.passkeys ?? [];

    const handleDelete = (id: number, onError: () => void) => {
        router.delete(destroy.url(id), {
            preserveScroll: true,
            onError,
        });
    };

    const handleRegisterSuccess = () => {
        router.reload();
    };

    if (!(props.canManagePasskeys ?? false)) {
        return null;
    }

    return (
        <div className="flex flex-col gap-6">
            <Heading
                variant="small"
                title="Passkey"
                description="Gestisci le passkey per accedere senza password"
            />

            <div className="divide-y divide-secondary overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary ring-inset">
                {passkeys.length > 0 ? (
                    passkeys.map((passkey) => (
                        <PasskeyItem
                            key={passkey.id}
                            passkey={passkey}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <EmptyState />
                )}
            </div>

            <PasskeyRegistration onSuccess={handleRegisterSuccess} />
        </div>
    );
};

export default ManagePasskeys;
