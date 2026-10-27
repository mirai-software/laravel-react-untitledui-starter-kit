import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

/**
 * Auth layout with the Mirai brand panel on large screens.
 * The brand link shows the app name from config; the tagline and footer credit Mirai.
 */
const AuthSplitLayout = ({ children, title, description }: AuthLayoutProps) => {
    const { name } = usePage().props;

    return (
        <div className="grid min-h-svh bg-primary lg:grid-cols-2">
            <div className="relative hidden flex-col justify-between overflow-hidden bg-primary-solid p-10 lg:flex dark:border-r dark:border-secondary">
                <div className="absolute -top-24 -right-24 size-96 rounded-full bg-white/5 blur-3xl" />

                <Link
                    href={home()}
                    className="relative flex items-center gap-2 self-start rounded-md text-lg font-semibold text-white outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                    <AppLogoIcon className="size-8 fill-current text-white" />
                    {name}
                </Link>

                <div className="relative max-w-md">
                    <h2 className="text-display-sm font-semibold tracking-tight text-balance text-white">
                        Software su misura.
                    </h2>
                    <p className="mt-3 text-lg text-balance text-white/70">
                        Progettiamo e sviluppiamo applicazioni web su misura,
                        dal cuore di Aversa.
                    </p>
                </div>

                <p className="relative text-sm text-white/50">
                    © {new Date().getFullYear()} Mirai · Aversa (CE)
                </p>
            </div>

            <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-8">
                <div className="flex w-full max-w-sm flex-col gap-8">
                    <div className="flex flex-col items-center gap-6 text-center">
                        <Link
                            href={home()}
                            className="rounded-md outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden"
                        >
                            <AppLogoIcon className="size-10 fill-current text-fg-brand-primary" />
                            <span className="sr-only">Torna alla home</span>
                        </Link>

                        <div className="flex flex-col gap-2 md:gap-3">
                            <h1 className="text-display-xs font-semibold text-primary md:text-display-sm">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-md text-tertiary">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthSplitLayout;
