import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const AuthCardLayout = ({ children, title, description }: AuthLayoutProps) => (
    <div className="flex min-h-svh flex-col items-center justify-center bg-secondary px-4 py-12 sm:px-8">
        <div className="flex w-full max-w-md flex-col gap-6">
            <Link
                href={home()}
                className="self-center rounded-md outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
            >
                <AppLogoIcon className="size-10 fill-current text-fg-brand-primary" />
                <span className="sr-only">Torna alla home</span>
            </Link>

            <div className="flex flex-col gap-8 rounded-xl bg-primary px-6 py-8 shadow-xs ring-1 ring-secondary ring-inset sm:px-10">
                <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-xl font-semibold text-primary">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-md text-tertiary">{description}</p>
                    )}
                </div>

                {children}
            </div>
        </div>
    </div>
);

export default AuthCardLayout;
