import { createInertiaApp, router } from '@inertiajs/react';
import { FormContext, RouterProvider } from 'react-aria-components';
import { Toaster } from '@/components/toaster';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        // Untitled UI links (React Aria) navigate with Inertia instead of reloading the page.
        return (
            <RouterProvider
                navigate={(href) => {
                    router.visit(href);
                }}
            >
                {/* Laravel validates the forms: React Aria fields only show the server errors (`isInvalid`)
                    and must not block the browser's submit, which "native" validation does until the error clears. */}
                <FormContext.Provider value={{ validationBehavior: 'aria' }}>
                    {app}
                    <Toaster />
                </FormContext.Provider>
            </RouterProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
