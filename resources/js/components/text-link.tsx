import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';
import { cx } from '@/utils/cx';

type TextLinkProps = ComponentProps<typeof Link>;

/**
 * Inline link styled like Untitled UI's "link-color" button.
 * It uses Inertia's Link, so it also supports options like `method` (e.g. logout).
 */
const TextLink = ({ className, children, ...props }: TextLinkProps) => (
    <Link
        className={cx(
            'rounded-xs font-semibold text-brand-secondary underline decoration-transparent underline-offset-2 outline-focus-ring transition duration-100 ease-linear hover:text-brand-secondary_hover hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2',
            className,
        )}
        {...props}
    >
        {children}
    </Link>
);

export default TextLink;
