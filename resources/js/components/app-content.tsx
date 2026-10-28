import type { ComponentProps } from 'react';
import type { AppVariant } from '@/types';
import { cx } from '@/utils/cx';

type AppContentProps = ComponentProps<'main'> & {
    /** Kept so upstream's `app-sidebar-layout.tsx` works unchanged (see `AppShell`). */
    variant?: AppVariant;
};

const AppContent = ({
    variant: _variant,
    children,
    className,
    ...props
}: AppContentProps) => (
    <main className={cx('flex min-w-0 flex-1 flex-col', className)} {...props}>
        {children}
    </main>
);

export { AppContent };
