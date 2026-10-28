import { router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { AppVariant } from '@/types';

type SidebarContextValue = {
    /** Desktop sidebar visibility, remembered in the `sidebar_state` cookie. */
    isOpen: boolean;
    toggle: () => void;
    /** Mobile navigation drawer. */
    isMobileOpen: boolean;
    setMobileOpen: (isOpen: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue>({
    isOpen: true,
    toggle: () => {},
    isMobileOpen: false,
    setMobileOpen: () => {},
});

const useSidebar = () => useContext(SidebarContext);

const rememberSidebarState = (isOpen: boolean): void => {
    document.cookie = `sidebar_state=${isOpen ? 'true' : 'false'};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
};

type AppShellProps = {
    children: ReactNode;
    /**
     * Kept so upstream's `app-sidebar-layout.tsx` works unchanged. The kit only has the
     * sidebar layout: upstream's alternative top-bar layout isn't part of it.
     */
    variant?: AppVariant;
};

/** Tailwind's `lg` breakpoint, where the sidebar replaces the mobile drawer. */
const desktopQuery = '(min-width: 1024px)';

const AppShell = ({ children }: AppShellProps) => {
    const { sidebarOpen } = usePage().props;
    const [isOpen, setIsOpen] = useState<boolean>(sidebarOpen);
    const [isMobileOpen, setMobileOpen] = useState(false);

    // Close the mobile drawer whenever a visit completes.
    useEffect(() => router.on('navigate', () => setMobileOpen(false)), []);

    // Close it when the window grows to desktop width (e.g. a tablet rotated), where it's hidden.
    useEffect(() => {
        const desktop = window.matchMedia(desktopQuery);
        const closeOnDesktop = (event: MediaQueryListEvent): void => {
            if (event.matches) {
                setMobileOpen(false);
            }
        };

        desktop.addEventListener('change', closeOnDesktop);

        return () => desktop.removeEventListener('change', closeOnDesktop);
    }, []);

    const toggle = (): void => {
        rememberSidebarState(!isOpen);
        setIsOpen(!isOpen);
    };

    return (
        <SidebarContext.Provider
            value={{ isOpen, toggle, isMobileOpen, setMobileOpen }}
        >
            <div className="flex min-h-dvh w-full bg-primary">{children}</div>
        </SidebarContext.Provider>
    );
};

export { AppShell, useSidebar };
