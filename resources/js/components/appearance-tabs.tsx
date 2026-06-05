import { Monitor01, Moon01, Sun } from '@untitledui/icons';
import type { ComponentType, HTMLAttributes, SVGAttributes } from 'react';

import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cx } from '@/lib/utils';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: {
        value: Appearance;
        icon: ComponentType<SVGAttributes<SVGElement>>;
        label: string;
    }[] = [
        { value: 'light', icon: Sun, label: 'Chiaro' },
        { value: 'dark', icon: Moon01, label: 'Scuro' },
        { value: 'system', icon: Monitor01, label: 'Sistema' },
    ];

    return (
        <div
            className={cx(
                'inline-flex gap-1 rounded-lg bg-bg-secondary p-1 dark:bg-bg-secondary',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    className={cx(
                        'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                        appearance === value
                            ? 'bg-bg-primary shadow-xs dark:bg-bg-tertiary'
                            : 'text-text-tertiary hover:bg-neutral-200/60 hover:text-black dark:hover:bg-neutral-700/60',
                    )}
                >
                    <Icon className="-ml-1 h-4 w-4" />
                    <span className="ml-1.5 text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
}
