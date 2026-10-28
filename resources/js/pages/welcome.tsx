import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/base/buttons/button';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';
import { dashboard, login, register } from '@/routes';

const Welcome = () => {
    const { auth } = usePage().props;
    const isAuthenticated = Boolean(auth.user);

    return (
        <>
            <Head title="Benvenuto" />

            <AuthSplitLayout
                title={isAuthenticated ? 'Bentornato' : 'Benvenuto'}
                description={
                    isAuthenticated
                        ? 'Sei già connesso. Vai alla tua area di lavoro.'
                        : 'Accedi per continuare, oppure crea un nuovo account.'
                }
            >
                <div className="flex flex-col gap-3">
                    {isAuthenticated ? (
                        <Button
                            href={dashboard().url}
                            size="lg"
                            className="w-full"
                        >
                            Vai alla dashboard
                        </Button>
                    ) : (
                        <>
                            <Button
                                href={login().url}
                                size="lg"
                                className="w-full"
                            >
                                Accedi
                            </Button>
                            <Button
                                href={register().url}
                                color="secondary"
                                size="lg"
                                className="w-full"
                            >
                                Registrati
                            </Button>
                        </>
                    )}
                </div>
            </AuthSplitLayout>
        </>
    );
};

export default Welcome;
