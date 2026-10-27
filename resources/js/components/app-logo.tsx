import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

const AppLogo = () => {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-solid">
                <AppLogoIcon className="size-5 fill-current text-white" />
            </div>
            <span className="truncate text-md font-semibold text-primary">
                {name}
            </span>
        </>
    );
};

export default AppLogo;
