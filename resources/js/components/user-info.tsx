import { Avatar } from '@/components/base/avatar/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

type UserInfoProps = {
    user: User;
    showEmail?: boolean;
};

const UserInfo = ({ user, showEmail = false }: UserInfoProps) => {
    const getInitials = useInitials();

    return (
        <>
            <Avatar
                size="sm"
                src={user.avatar}
                alt={user.name}
                initials={getInitials(user.name)}
            />
            <div className="grid min-w-0 flex-1 text-left text-sm">
                <span className="truncate font-semibold text-primary">
                    {user.name}
                </span>
                {showEmail && (
                    <span className="truncate text-tertiary">{user.email}</span>
                )}
            </div>
        </>
    );
};

export { UserInfo };
