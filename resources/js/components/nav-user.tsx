import { usePage } from '@inertiajs/react';
import { ChevronSelectorVertical } from '@untitledui/icons';
import { Button as AriaButton } from 'react-aria-components';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';

const NavUser = () => {
    const { auth } = usePage().props;

    return (
        <Dropdown.Root>
            <AriaButton
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                data-test="sidebar-menu-button"
            >
                <UserInfo user={auth.user} />
                <ChevronSelectorVertical className="size-4 shrink-0 text-fg-quaternary" />
            </AriaButton>
            <Dropdown.Popover placement="top end" className="w-64">
                <UserMenuContent />
            </Dropdown.Popover>
        </Dropdown.Root>
    );
};

export { NavUser };
