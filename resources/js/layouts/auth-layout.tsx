import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import type { AuthLayoutProps } from '@/types';

const AuthLayout = ({
    title = '',
    description = '',
    children,
}: AuthLayoutProps) => (
    <AuthLayoutTemplate title={title} description={description}>
        {children}
    </AuthLayoutTemplate>
);

export default AuthLayout;
