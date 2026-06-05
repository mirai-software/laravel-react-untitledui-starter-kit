import { Link } from '@inertiajs/react';
import { Grid01, Settings01, Shield01, Users01 } from '@untitledui/icons';

import { useSidebar } from '@/components/app-shell';
import { NavList } from '@/components/application/app-navigation/base-components/nav-list';
import type { NavItemType } from '@/components/application/app-navigation/config';
import { NavUser } from '@/components/nav-user';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { usePermissions } from '@/hooks/use-permissions';
import { cx, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit } from '@/routes/profile';
import { index as rolesIndex } from '@/routes/roles';
import { index as usersIndex } from '@/routes/users';

import AppLogo from './app-logo';

export function AppSidebar() {
    const { can } = usePermissions();
    const { isOpen, isMobile, setOpen } = useSidebar();
    const { currentUrl } = useCurrentUrl();
    const mainNavItems: NavItemType[] = [
        { label: 'Dashboard', href: toUrl(dashboard()), icon: Grid01 },
        ...(can('roles.view')
            ? [{ label: 'Ruoli', href: toUrl(rolesIndex()), icon: Shield01 }]
            : []),
        ...(can('users.view')
            ? [{ label: 'Utenti', href: toUrl(usersIndex()), icon: Users01 }]
            : []),
        { label: 'Settings', href: toUrl(edit()), icon: Settings01 },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-950/60"
                    onClick={() => setOpen(false)}
                />
            )}

            <aside
                className={cx(
                    'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border-secondary bg-bg-primary transition-transform duration-200 ease-in-out lg:relative lg:z-auto lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center px-4">
                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center gap-2"
                    >
                        <AppLogo />
                    </Link>
                </div>

                {/* Main navigation */}
                <div className="flex-1 overflow-y-auto">
                    <NavList
                        activeUrl={currentUrl}
                        items={mainNavItems}
                        className="mt-0"
                    />
                </div>

                {/* User */}
                <div className="shrink-0 border-t border-border-secondary">
                    <NavUser />
                </div>
            </aside>
        </>
    );
}
