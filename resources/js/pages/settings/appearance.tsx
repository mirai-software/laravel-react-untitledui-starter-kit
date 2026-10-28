import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

const Appearance = () => (
    <>
        <Head title="Impostazioni aspetto" />

        <h1 className="sr-only">Impostazioni aspetto</h1>

        <div className="flex flex-col gap-6">
            <Heading
                variant="small"
                title="Aspetto"
                description="Scegli il tema chiaro, scuro o quello del sistema"
            />
            <AppearanceTabs />
        </div>
    </>
);

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Impostazioni aspetto',
            href: editAppearance(),
        },
    ],
};

export default Appearance;
