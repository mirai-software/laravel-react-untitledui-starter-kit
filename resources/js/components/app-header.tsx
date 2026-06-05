import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen01,
    Folder,
    Grid01,
    Menu01,
    SearchLg,
} from '@untitledui/icons';
import { Button as AriaButton } from 'react-aria-components';

import { SlideoutMenu } from '@/components/application/slideout-menus/slideout-menu';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { Tooltip } from '@/components/base/tooltip/tooltip';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cx, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';

import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

type Props = { breadcrumbs?: BreadcrumbItem[] };

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: Grid01 },
];
const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen01,
    },
];

const activeItemStyles = 'text-text-primary dark:text-gray-100';

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();

    return (
        <>
            <div className="border-b border-border-secondary">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <SlideoutMenu.Trigger>
                            <Button
                                color="tertiary"
                                size="sm"
                                iconLeading={Menu01}
                                className="mr-2"
                            />
                            <SlideoutMenu.Content>
                                <SlideoutMenu.Header>
                                    <AppLogoIcon className="h-6 w-6 fill-current text-text-primary" />
                                </SlideoutMenu.Header>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && (
                                                        <item.icon className="h-5 w-5" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {rightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={toUrl(item.href)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && (
                                                        <item.icon className="h-5 w-5" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SlideoutMenu.Content>
                        </SlideoutMenu.Trigger>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <nav className="flex h-full items-stretch">
                            <ul className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <li
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cx(
                                                'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-bg-primary_hover',
                                                whenCurrentUrl(
                                                    item.href,
                                                    activeItemStyles,
                                                    'text-text-tertiary',
                                                ),
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {item.title}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-text-primary" />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            <button className="group inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-bg-primary_hover">
                                <SearchLg className="!size-5 opacity-80 group-hover:opacity-100" />
                            </button>
                            <div className="ml-1 hidden gap-1 lg:flex">
                                {rightNavItems.map((item) => (
                                    <Tooltip
                                        key={item.title}
                                        title={item.title}
                                    >
                                        <a
                                            href={toUrl(item.href)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-bg-primary_hover"
                                        >
                                            <span className="sr-only">
                                                {item.title}
                                            </span>
                                            {item.icon && (
                                                <item.icon className="size-5 opacity-80 group-hover:opacity-100" />
                                            )}
                                        </a>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                        <Dropdown.Root>
                            <AriaButton className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full p-1 outline-focus-ring transition-colors hover:bg-bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2">
                                <Avatar
                                    size="sm"
                                    src={auth.user.avatar}
                                    alt={auth.user.name}
                                    initials={getInitials(auth.user.name)}
                                />
                            </AriaButton>
                            <Dropdown.Popover
                                placement="bottom end"
                                className="min-w-60"
                            >
                                <div className="flex items-center gap-2 border-b border-border-secondary px-3 py-2.5 text-sm">
                                    <UserInfo
                                        user={auth.user}
                                        showEmail={true}
                                    />
                                </div>
                                <Dropdown.Menu>
                                    <UserMenuContent />
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown.Root>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-border-secondary">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-text-tertiary md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
