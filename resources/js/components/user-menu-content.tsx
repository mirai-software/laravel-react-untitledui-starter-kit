import { router, usePage } from '@inertiajs/react';
import {
    LogOut01,
    Monitor01,
    Moon01,
    Settings01,
    Sun,
} from '@untitledui/icons';
import type { FC } from 'react';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { UserInfo } from '@/components/user-info';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';

const themeOptions: {
    value: Appearance;
    label: string;
    icon: FC<{ className?: string }>;
}[] = [
    { value: 'light', label: 'Tema chiaro', icon: Sun },
    { value: 'dark', label: 'Tema scuro', icon: Moon01 },
    { value: 'system', label: 'Tema di sistema', icon: Monitor01 },
];

/** Contents of the user dropdown, shared by the sidebar and the header. */
const UserMenuContent = () => {
    const { auth } = usePage().props;
    const { appearance, updateAppearance } = useAppearance();

    return (
        <>
            <div className="flex items-center gap-3 border-b border-secondary px-4 py-3">
                <UserInfo user={auth.user} showEmail />
            </div>

            <Dropdown.Menu>
                <Dropdown.Item
                    label="Impostazioni"
                    icon={Settings01}
                    href={edit().url}
                />
                <Dropdown.Separator />
                {themeOptions.map((option) => (
                    <Dropdown.Item
                        key={option.value}
                        label={option.label}
                        icon={option.icon}
                        addon={
                            appearance === option.value ? 'Attivo' : undefined
                        }
                        onAction={() => updateAppearance(option.value)}
                    />
                ))}
                <Dropdown.Separator />
                <Dropdown.Item
                    label="Esci"
                    icon={LogOut01}
                    data-test="logout-button"
                    onAction={() => {
                        router.flushAll();
                        router.post(logout().url);
                    }}
                />
            </Dropdown.Menu>
        </>
    );
};

export { UserMenuContent };
