import { Link, usePage } from '@inertiajs/react';
import { Grid01, Menu02, Shield01, Users01 } from '@untitledui/icons';
import { Button as AriaButton } from 'react-aria-components';
import AppLogo from '@/components/app-logo';
import { SlideoutMenu } from '@/components/application/slideout-menus/slideout-menu';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { usePermissions } from '@/hooks/use-permissions';
import { dashboard } from '@/routes';
import { index as rolesIndex } from '@/routes/roles';
import { index as usersIndex } from '@/routes/users';
import type { BreadcrumbItem, NavItem } from '@/types';
import { cx } from '@/utils/cx';

const navLinkStyles =
    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2';

type AppHeaderProps = {
    breadcrumbs?: BreadcrumbItem[];
};

const AppHeader = ({ breadcrumbs = [] }: AppHeaderProps) => {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { can } = usePermissions();

    const mainNavItems: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: Grid01 },
        ...(can('roles.view')
            ? [{ title: 'Ruoli', href: rolesIndex(), icon: Shield01 }]
            : []),
        ...(can('users.view')
            ? [{ title: 'Utenti', href: usersIndex(), icon: Users01 }]
            : []),
    ];

    return (
        <>
            <header className="border-b border-secondary bg-primary">
                <div className="mx-auto flex h-16 items-center gap-4 px-4 md:max-w-7xl">
                    <SlideoutMenu.Trigger>
                        <Button
                            color="tertiary"
                            size="sm"
                            iconLeading={Menu02}
                            aria-label="Apri il menu"
                            className="lg:hidden"
                        />
                        <SlideoutMenu isDismissable>
                            {({ close }) => (
                                <>
                                    <SlideoutMenu.Header onClose={close}>
                                        <div className="flex items-center gap-2.5">
                                            <AppLogo />
                                        </div>
                                    </SlideoutMenu.Header>
                                    <SlideoutMenu.Content>
                                        <nav className="flex flex-col gap-1">
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    onClick={close}
                                                    className={cx(
                                                        navLinkStyles,
                                                        'text-secondary hover:bg-primary_hover',
                                                    )}
                                                >
                                                    {item.icon && (
                                                        <item.icon className="size-5 text-fg-quaternary" />
                                                    )}
                                                    {item.title}
                                                </Link>
                                            ))}
                                        </nav>
                                    </SlideoutMenu.Content>
                                </>
                            )}
                        </SlideoutMenu>
                    </SlideoutMenu.Trigger>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center gap-2.5 rounded-md outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        <AppLogo />
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {mainNavItems.map((item) => {
                            const isActive = isCurrentOrParentUrl(item.href);

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    prefetch
                                    aria-current={isActive ? 'page' : undefined}
                                    className={cx(
                                        navLinkStyles,
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

                    <div className="ml-auto">
                        <Dropdown.Root>
                            <AriaButton
                                aria-label="Menu utente"
                                className="cursor-pointer rounded-full outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                                <Avatar
                                    size="md"
                                    src={auth.user.avatar}
                                    alt={auth.user.name}
                                    initials={getInitials(auth.user.name)}
                                />
                            </AriaButton>
                            <Dropdown.Popover
                                placement="bottom end"
                                className="w-64"
                            >
                                <UserMenuContent />
                            </Dropdown.Popover>
                        </Dropdown.Root>
                    </div>
                </div>
            </header>

            {breadcrumbs.length > 1 && (
                <div className="border-b border-secondary">
                    <div className="mx-auto flex h-12 items-center px-4 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
};

export { AppHeader };
