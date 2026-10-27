import { router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

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
    variant?: 'header' | 'sidebar';
};

const AppShell = ({ children, variant = 'header' }: AppShellProps) => {
    const { sidebarOpen } = usePage().props;
    const [isOpen, setIsOpen] = useState<boolean>(sidebarOpen);
    const [isMobileOpen, setMobileOpen] = useState(false);

    // Close the mobile drawer whenever a visit completes.
    useEffect(() => router.on('navigate', () => setMobileOpen(false)), []);

    const toggle = (): void => {
        setIsOpen((wasOpen) => {
            rememberSidebarState(!wasOpen);

            return !wasOpen;
        });
    };

    if (variant === 'header') {
        return (
            <div className="flex min-h-dvh w-full flex-col bg-primary">
                {children}
            </div>
        );
    }

    return (
        <SidebarContext.Provider
            value={{ isOpen, toggle, isMobileOpen, setMobileOpen }}
        >
            <div className="flex min-h-dvh w-full bg-primary">{children}</div>
        </SidebarContext.Provider>
    );
};

export { AppShell, useSidebar };
