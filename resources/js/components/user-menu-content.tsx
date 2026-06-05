import { router } from '@inertiajs/react';
import {
    LogOut01,
    Monitor01,
    Moon01,
    Settings01,
    Sun,
} from '@untitledui/icons';
import type { FC } from 'react';

import { Dropdown } from '@/components/base/dropdown/dropdown';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { toUrl } from '@/lib/utils';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';

const themeOptions: {
    value: Appearance;
    label: string;
    icon: FC<{ className?: string }>;
}[] = [
    { value: 'light', label: 'Chiaro', icon: Sun },
    { value: 'dark', label: 'Scuro', icon: Moon01 },
    { value: 'system', label: 'Sistema', icon: Monitor01 },
];

export function UserMenuContent() {
    const cleanup = useMobileNavigation();
    const { appearance, updateAppearance } = useAppearance();

    return (
        <>
            <Dropdown.Item
                label="Impostazioni profilo"
                icon={Settings01}
                onAction={() => {
                    cleanup();
                    router.visit(toUrl(edit()));
                }}
            />
            <Dropdown.Separator />
            {themeOptions.map((option) => (
                <Dropdown.Item
                    key={option.value}
                    label={option.label}
                    icon={option.icon}
                    addon={appearance === option.value ? 'Attivo' : undefined}
                    onAction={() => updateAppearance(option.value)}
                />
            ))}
            <Dropdown.Separator />
            <Dropdown.Item
                label="Esci"
                icon={LogOut01}
                data-test="logout-button"
                onAction={() => {
                    cleanup();
                    router.flushAll();
                    router.post(toUrl(logout()));
                }}
            />
        </>
    );
}
