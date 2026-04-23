import { Link } from '@inertiajs/react';

import { useCurrentUrl } from '@/hooks/use-current-url';
import { cx } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <nav className="space-y-1 px-3 py-2">
            <p className="mb-2 px-3 text-xs font-medium tracking-wider text-text-quaternary uppercase">
                Platform
            </p>
            {items.map((item) => (
                <Link
                    key={item.title}
                    href={item.href}
                    prefetch
                    className={cx(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isCurrentUrl(item.href)
                            ? 'bg-bg-primary_hover text-text-primary'
                            : 'text-text-secondary hover:bg-bg-primary_hover hover:text-text-primary',
                    )}
                >
                    {item.icon && <item.icon className="size-5" />}
                    <span>{item.title}</span>
                </Link>
            ))}
        </nav>
    );
}
