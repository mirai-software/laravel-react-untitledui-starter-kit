import { Link } from '@inertiajs/react';
import {
    BookOpen01,
    Folder,
    Grid01,
    Settings01,
    Shield01,
    Users01,
} from '@untitledui/icons';

import { useSidebar } from '@/components/app-shell';
import { NavItemBase } from '@/components/application/app-navigation/base-components/nav-item';
import { NavList } from '@/components/application/app-navigation/base-components/nav-list';
import type { NavItemType } from '@/components/application/app-navigation/config';
import { NavUser } from '@/components/nav-user';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cx, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit } from '@/routes/profile';
import { index as rolesIndex } from '@/routes/roles';
import { index as usersIndex } from '@/routes/users';

import AppLogo from './app-logo';

const mainNavItems: NavItemType[] = [
    { label: 'Dashboard', href: toUrl(dashboard()), icon: Grid01 },
    { label: 'Ruoli', href: toUrl(rolesIndex()), icon: Shield01 },
    { label: 'Utenti', href: toUrl(usersIndex()), icon: Users01 },
    { label: 'Settings', href: toUrl(edit()), icon: Settings01 },
];

const footerNavItems: NavItemType[] = [
    {
        label: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        label: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen01,
    },
];

export function AppSidebar() {
    const { isOpen, isMobile, setOpen } = useSidebar();
    const { currentUrl } = useCurrentUrl();

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

                {/* Footer navigation + user */}
                <div className="shrink-0 border-t border-border-secondary">
                    <ul className="flex flex-col px-2 py-2 lg:px-4">
                        {footerNavItems.map((item) => (
                            <li key={item.label} className="py-0.5">
                                <NavItemBase
                                    badge={item.badge}
                                    icon={item.icon}
                                    href={item.href}
                                    type="link"
                                    current={item.href === currentUrl}
                                >
                                    {item.label}
                                </NavItemBase>
                            </li>
                        ))}
                    </ul>
                    <NavUser />
                </div>
            </aside>
        </>
    );
}
