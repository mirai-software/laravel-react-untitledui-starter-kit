import { Head } from '@inertiajs/react';

import { PlaceholderPattern } from '@/components/placeholder-pattern';
import { dashboard } from '@/routes';

const stats = [
    { label: 'Total Users', value: '2,847', change: '+12.5%' },
    { label: 'Active Sessions', value: '1,024', change: '+8.2%' },
    { label: 'Bounce Rate', value: '24.3%', change: '-3.1%' },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex flex-col gap-1 rounded-xl border border-border-secondary p-5"
                        >
                            <span className="text-sm font-medium text-text-tertiary">
                                {stat.label}
                            </span>
                            <span className="text-2xl font-semibold text-text-primary">
                                {stat.value}
                            </span>
                            <span className="text-sm text-text-tertiary">
                                {stat.change} from last month
                            </span>
                        </div>
                    ))}
                </div>
                <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-xl border border-border-secondary md:min-h-[400px]">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-gray-900/20 dark:stroke-gray-100/20" />
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
