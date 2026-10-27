import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/placeholder-pattern';
import { dashboard } from '@/routes';

const Panel = ({ className }: { className?: string }) => (
    <div
        className={`relative overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary ring-inset ${className ?? ''}`}
    >
        <PlaceholderPattern className="absolute inset-0 size-full stroke-fg-quaternary/20" />
    </div>
);

const Dashboard = () => (
    <>
        <Head title="Dashboard" />

        <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
            <div className="grid auto-rows-min gap-6 md:grid-cols-3">
                <Panel className="aspect-video" />
                <Panel className="aspect-video" />
                <Panel className="aspect-video" />
            </div>
            <Panel className="min-h-[60vh] flex-1 md:min-h-min" />
        </div>
    </>
);

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};

export default Dashboard;
