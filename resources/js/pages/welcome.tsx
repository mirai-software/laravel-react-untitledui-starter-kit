import { Head, Link, usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, home, login, register } from '@/routes';

type Props = {
    canRegister?: boolean;
};

const ctaBase =
    'inline-flex items-center justify-center rounded-lg px-4.5 py-3 text-md font-semibold shadow-xs-skeuomorphic ring-1 outline-brand transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2';
const ctaPrimary = `${ctaBase} bg-brand-solid text-white ring-transparent hover:bg-brand-solid_hover`;
const ctaSecondary = `${ctaBase} bg-primary text-secondary ring-primary hover:bg-primary_hover hover:text-secondary_hover`;

const Welcome = ({ canRegister = true }: Props) => {
    const { auth } = usePage().props;
    const isAuthenticated = Boolean(auth.user);

    return (
        <>
            <Head title="Benvenuto" />

            <div className="relative grid h-dvh grid-cols-1 lg:grid-cols-2">
                {/* Pannello brand (solo desktop) */}
                <div className="relative hidden flex-col justify-between overflow-hidden bg-gray-900 p-10 text-white lg:flex">
                    <div className="absolute -top-24 -right-24 size-96 rounded-full bg-white/5 blur-3xl" />

                    <Link
                        href={home()}
                        className="relative z-20 flex items-center gap-2 text-lg font-semibold text-white"
                    >
                        <AppLogoIcon className="size-8 fill-current text-white" />
                        Mirai
                    </Link>

                    <div className="relative z-20 max-w-md">
                        <h2 className="text-3xl font-semibold tracking-tight text-balance text-white">
                            Software su misura.
                        </h2>
                        <p className="mt-3 text-lg text-balance text-white/70">
                            Progettiamo e sviluppiamo applicazioni web su
                            misura, dal cuore di Aversa.
                        </p>
                    </div>

                    <p className="relative z-20 text-sm text-white/50">
                        © {new Date().getFullYear()} Mirai · Aversa (CE)
                    </p>
                </div>

                {/* Pannello accesso */}
                <div className="flex w-full items-center justify-center p-6 lg:p-8">
                    <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
                        <Link
                            href={home()}
                            className="flex items-center justify-center gap-2 text-lg font-semibold text-text-primary lg:hidden"
                        >
                            <AppLogoIcon className="size-8 fill-current text-text-primary" />
                            Mirai
                        </Link>

                        <div className="flex flex-col gap-2 text-center">
                            <h1 className="text-2xl font-semibold text-text-primary">
                                Bentornato
                            </h1>
                            <p className="text-balance text-text-tertiary">
                                {isAuthenticated
                                    ? 'Sei già connesso. Vai alla tua area di lavoro.'
                                    : 'Accedi per continuare, oppure crea un nuovo account.'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            {isAuthenticated ? (
                                <Link href={dashboard()} className={ctaPrimary}>
                                    Vai alla dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} className={ctaPrimary}>
                                        Accedi
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className={ctaSecondary}
                                        >
                                            Registrati
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Welcome;
