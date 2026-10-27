import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps } from '@/types';

const AppHeaderLayout = ({ children, breadcrumbs }: AppLayoutProps) => (
    <AppShell>
        <AppHeader breadcrumbs={breadcrumbs} />
        <AppContent>{children}</AppContent>
    </AppShell>
);

export default AppHeaderLayout;
