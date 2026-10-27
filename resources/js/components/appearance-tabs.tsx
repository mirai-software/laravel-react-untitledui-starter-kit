import { Monitor01, Moon01, Sun } from '@untitledui/icons';
import type { FC, HTMLAttributes } from 'react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cx } from '@/utils/cx';

const tabs: {
    value: Appearance;
    icon: FC<{ className?: string }>;
    label: string;
}[] = [
    { value: 'light', icon: Sun, label: 'Chiaro' },
    { value: 'dark', icon: Moon01, label: 'Scuro' },
    { value: 'system', icon: Monitor01, label: 'Sistema' },
];

const AppearanceTabs = ({
    className,
    ...props
}: HTMLAttributes<HTMLDivElement>) => {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div
            role="group"
            aria-label="Tema"
            className={cx(
                'inline-flex w-fit gap-1 rounded-lg bg-secondary p-1 ring-1 ring-secondary ring-inset',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => {
                const isActive = appearance === value;

                return (
                    <button
                        key={value}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => updateAppearance(value)}
                        className={cx(
                            'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2',
                            isActive
                                ? 'bg-primary text-secondary shadow-xs ring-1 ring-primary ring-inset'
                                : 'text-quaternary hover:text-secondary',
                        )}
                    >
                        <Icon
                            className={cx(
                                'size-4',
                                isActive
                                    ? 'text-fg-secondary'
                                    : 'text-fg-quaternary',
                            )}
                        />
                        {label}
                    </button>
                );
            })}
        </div>
    );
};

export default AppearanceTabs;
