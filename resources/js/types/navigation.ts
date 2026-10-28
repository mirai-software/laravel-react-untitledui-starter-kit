import type { InertiaLinkProps } from '@inertiajs/react';
import type { FC } from 'react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: FC<{ className?: string }> | null;
    isActive?: boolean;
};
