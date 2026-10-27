import type { ComponentProps } from 'react';
import { cx } from '@/utils/cx';

type AppContentProps = ComponentProps<'main'> & {
    variant?: 'header' | 'sidebar';
};

const AppContent = ({
    variant = 'header',
    children,
    className,
    ...props
}: AppContentProps) => (
    <main
        className={cx(
            variant === 'sidebar'
                ? 'flex min-w-0 flex-1 flex-col'
                : 'mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4',
            className,
        )}
        {...props}
    >
        {children}
    </main>
);

export { AppContent };
