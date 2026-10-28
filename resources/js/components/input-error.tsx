import type { HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';

type InputErrorProps = HTMLAttributes<HTMLParagraphElement> & {
    message?: string | null;
};

/**
 * Error message for fields that can't show it as their own hint
 * (for example the passkey button or a group of checkboxes).
 */
const InputError = ({ message, className, ...props }: InputErrorProps) =>
    message ? (
        <p {...props} className={cx('text-sm text-error-primary', className)}>
            {message}
        </p>
    ) : null;

export default InputError;
