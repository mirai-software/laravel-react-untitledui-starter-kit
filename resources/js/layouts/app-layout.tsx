import type { ReactNode } from 'react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

type AppLayoutProps = {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
};

const AppLayout = ({ breadcrumbs = [], children }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs}>{children}</AppLayoutTemplate>
);

export default AppLayout;
