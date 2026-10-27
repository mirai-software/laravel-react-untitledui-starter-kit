import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';
import { cx } from '@/utils/cx';

const sidebarNavItems: NavItem[] = [
    { title: 'Profilo', href: edit(), icon: null },
    { title: 'Sicurezza', href: editSecurity(), icon: null },
    { title: 'Aspetto', href: editAppearance(), icon: null },
];

const SettingsLayout = ({ children }: PropsWithChildren) => {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="px-4 py-6 md:px-6 md:py-8">
            <Heading
                title="Impostazioni"
                description="Gestisci il profilo e le impostazioni dell'account"
            />

            <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                <aside className="w-full lg:w-48 lg:shrink-0">
                    <nav
                        className="flex gap-1 overflow-x-auto lg:flex-col"
                        aria-label="Impostazioni"
                    >
                        {sidebarNavItems.map((item) => {
                            const isActive = isCurrentOrParentUrl(item.href);

                            return (
                                <Link
                                    key={toUrl(item.href)}
                                    href={item.href}
                                    prefetch
                                    aria-current={isActive ? 'page' : undefined}
                                    className={cx(
                                        'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2',
                                        isActive
                                            ? 'bg-secondary text-secondary_hover hover:bg-secondary_hover'
                                            : 'text-secondary hover:bg-primary_hover hover:text-secondary_hover',
                                    )}
                                >
                                    {item.icon && (
                                        <item.icon className="size-5 text-fg-quaternary" />
                                    )}
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="h-px bg-border-secondary lg:hidden" />

                <div className="min-w-0 flex-1 md:max-w-2xl">
                    <section className="flex max-w-xl flex-col gap-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SettingsLayout;
