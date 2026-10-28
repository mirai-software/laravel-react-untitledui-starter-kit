import { LayoutLeft, Menu02 } from '@untitledui/icons';
import { useSidebar } from '@/components/app-shell';
import { Button } from '@/components/base/buttons/button';
import { Breadcrumbs } from '@/components/breadcrumbs';
import type { BreadcrumbItem } from '@/types';

type AppSidebarHeaderProps = {
    breadcrumbs?: BreadcrumbItem[];
};

const AppSidebarHeader = ({ breadcrumbs = [] }: AppSidebarHeaderProps) => {
    const { isOpen, toggle, isMobileOpen, setMobileOpen } = useSidebar();

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-secondary px-4 md:px-6">
            <Button
                color="tertiary"
                size="sm"
                iconLeading={Menu02}
                aria-label="Apri il menu"
                aria-expanded={isMobileOpen}
                className="lg:hidden"
                onPress={() => setMobileOpen(true)}
            />
            <Button
                color="tertiary"
                size="sm"
                iconLeading={LayoutLeft}
                aria-label="Barra laterale"
                aria-expanded={isOpen}
                className="hidden lg:inline-flex"
                onPress={toggle}
            />
            <Breadcrumbs breadcrumbs={breadcrumbs} />
        </header>
    );
};

export { AppSidebarHeader };
