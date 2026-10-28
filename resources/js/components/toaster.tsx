import type { CSSProperties } from 'react';
import type { ToasterProps } from 'sonner';
import { Toaster as Sonner } from 'sonner';
import { useAppearance } from '@/hooks/use-appearance';
import { useFlashToast } from '@/hooks/use-flash-toast';

/**
 * Toast notifications (sonner) in the Untitled UI theme's colors and font.
 * Also shows the toasts the server flashes with `Inertia::flash('toast', …)`.
 */
const Toaster = (props: ToasterProps) => {
    const { appearance } = useAppearance();

    useFlashToast();

    return (
        <Sonner
            theme={appearance}
            position="bottom-right"
            containerAriaLabel="Notifiche"
            style={
                {
                    '--normal-bg': 'var(--color-bg-primary)',
                    '--normal-text': 'var(--color-text-primary)',
                    '--normal-border': 'var(--color-border-secondary)',
                    '--border-radius': 'var(--radius-xl, 0.75rem)',
                    fontFamily: 'var(--font-body)',
                } as CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };
