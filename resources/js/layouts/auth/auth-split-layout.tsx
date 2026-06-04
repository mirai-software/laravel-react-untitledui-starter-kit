import { Link } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-gray-900 p-10 text-white lg:flex dark:border-r dark:border-border-secondary">
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
                        Progettiamo e sviluppiamo applicazioni web su misura,
                        dal cuore di Aversa.
                    </p>
                </div>

                <p className="relative z-20 text-sm text-white/50">
                    © {new Date().getFullYear()} Mirai · Aversa (CE)
                </p>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10 fill-current text-text-primary sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-text-tertiary">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
