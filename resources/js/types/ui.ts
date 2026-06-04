import type { ReactElement, ReactNode } from 'react';

import type { BreadcrumbItem } from './navigation';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

/**
 * Pagina Inertia (arrow function) con breadcrumbs statici letti dall'AppLayout.
 */
export type PageWithBreadcrumbs<P = Record<string, unknown>> = ((
    props: P,
) => ReactElement) & {
    layout?: { breadcrumbs: BreadcrumbItem[] };
};

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
};
