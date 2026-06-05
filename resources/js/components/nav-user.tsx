import { usePage } from '@inertiajs/react';
import { ChevronSelectorVertical } from '@untitledui/icons';
import { Button as AriaButton } from 'react-aria-components';

import { Dropdown } from '@/components/base/dropdown/dropdown';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';

export function NavUser() {
    const { auth } = usePage().props;

    return (
        <div className="px-3 py-2">
            <Dropdown.Root>
                <AriaButton
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm outline-focus-ring transition-colors hover:bg-bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                    data-test="sidebar-menu-button"
                >
                    <UserInfo user={auth.user} />
                    <ChevronSelectorVertical className="ml-auto size-4 text-text-quaternary" />
                </AriaButton>
                <Dropdown.Popover placement="top end" className="min-w-60">
                    <div className="flex items-center gap-2 border-b border-border-secondary px-3 py-2.5 text-sm">
                        <UserInfo user={auth.user} showEmail={true} />
                    </div>
                    <Dropdown.Menu>
                        <UserMenuContent />
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown.Root>
        </div>
    );
}
