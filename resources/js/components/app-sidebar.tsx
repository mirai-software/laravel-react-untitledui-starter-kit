import { Link } from '@inertiajs/react';
import { Grid01, X as CloseIcon } from '@untitledui/icons';
import {
    Button as AriaButton,
    Dialog as AriaDialog,
    Modal as AriaModal,
    ModalOverlay as AriaModalOverlay,
} from 'react-aria-components';
import AppLogo from '@/components/app-logo';
import { useSidebar } from '@/components/app-shell';
import { NavList } from '@/components/application/app-navigation/base-components/nav-list';
import type { NavItemType } from '@/components/application/app-navigation/config';
import { NavUser } from '@/components/nav-user';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import { cx } from '@/utils/cx';

const mainNavItems: NavItemType[] = [
    { label: 'Dashboard', href: dashboard().url, icon: Grid01 },
];

/** The nav item for the current page, also when it's a sub-page (e.g. `/users/1/edit`). */
const findActiveHref = (
    items: NavItemType[],
    currentUrl: string,
): string | undefined =>
    items.find(
        (item) =>
            item.href !== undefined &&
            (currentUrl === item.href ||
                currentUrl.startsWith(`${item.href}/`)),
    )?.href;

const SidebarContent = () => {
    const { currentUrl } = useCurrentUrl();

    return (
        <div className="flex h-full flex-col bg-primary pt-5">
            <div className="px-4 lg:px-5">
                <Link
                    href={dashboard()}
                    prefetch
                    className="flex items-center gap-2.5 rounded-md outline-focus-ring focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                    <AppLogo />
                </Link>
            </div>

            <NavList
                activeUrl={findActiveHref(mainNavItems, currentUrl)}
                items={mainNavItems}
            />

            <div className="mt-auto border-t border-secondary px-2 py-3 lg:px-3">
                <NavUser />
            </div>
        </div>
    );
};

const AppSidebar = () => {
    const { isOpen, isMobileOpen, setMobileOpen } = useSidebar();

    return (
        <>
            <aside
                className={cx(
                    'sticky top-0 hidden h-dvh w-72 shrink-0 border-r border-secondary',
                    isOpen && 'lg:block',
                )}
            >
                <SidebarContent />
            </aside>

            <AriaModalOverlay
                isOpen={isMobileOpen}
                onOpenChange={setMobileOpen}
                isDismissable
                className={({ isEntering, isExiting }) =>
                    cx(
                        'fixed inset-0 z-50 bg-overlay/70 pr-16 backdrop-blur-md lg:hidden',
                        isEntering &&
                            'duration-300 ease-in-out animate-in fade-in',
                        isExiting &&
                            'duration-200 ease-in-out animate-out fade-out',
                    )
                }
            >
                <AriaButton
                    aria-label="Chiudi il menu"
                    onPress={() => setMobileOpen(false)}
                    className="fixed top-2.5 right-3 flex cursor-pointer items-center justify-center rounded-lg p-2 text-fg-white/70 outline-focus-ring hover:bg-white/10 hover:text-fg-white focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                    <CloseIcon className="size-6" />
                </AriaButton>

                <AriaModal className="h-dvh w-full max-w-72">
                    <AriaDialog
                        aria-label="Menu di navigazione"
                        className="h-full outline-hidden"
                    >
                        {/* Close as soon as a link is tapped, also when it points to the current page
                            (Inertia doesn't fire `navigate` for same-URL visits). */}
                        <div
                            className="h-full"
                            onClickCapture={(event) => {
                                if (
                                    event.target instanceof Element &&
                                    event.target.closest('a[href]')
                                ) {
                                    setMobileOpen(false);
                                }
                            }}
                        >
                            <SidebarContent />
                        </div>
                    </AriaDialog>
                </AriaModal>
            </AriaModalOverlay>
        </>
    );
};

export { AppSidebar };
