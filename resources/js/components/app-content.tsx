import type { ComponentProps, ReactNode } from 'react';

import { cx } from '@/lib/utils';

type Props = ComponentProps<'main'> & {
    variant?: 'header' | 'sidebar';
    children?: ReactNode;
};

export function AppContent({
    variant = 'header',
    children,
    className,
    ...props
}: Props) {
    if (variant === 'sidebar') {
        return (
            <main
                className={cx(
                    'flex w-full min-w-0 flex-1 flex-col overflow-x-hidden',
                    className,
                )}
                {...props}
            >
                {children}
            </main>
        );
    }

    return (
        <main
            className={cx(
                'mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl',
                className,
            )}
            {...props}
        >
            {children}
        </main>
    );
}
