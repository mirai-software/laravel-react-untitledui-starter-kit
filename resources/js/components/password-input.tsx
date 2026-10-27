import { HintText } from '@/components/base/input/hint-text';
import type { InputProps } from '@/components/base/input/input';
import { InputBase, TextField } from '@/components/base/input/input';
import { Label } from '@/components/base/input/label';

type PasswordInputProps = Omit<
    InputProps,
    | 'type'
    | 'icon'
    | 'shortcut'
    | 'tooltip'
    | 'groupRef'
    | 'iconClassName'
    | 'tooltipClassName'
> & {
    /** Password requirements for password managers, e.g. `minlength: 8;`. */
    passwordrules?: string;
};

/**
 * Untitled UI's Input for passwords (with its show/hide toggle), plus the
 * `passwordrules` attribute, which Untitled UI's Input doesn't pass on.
 */
const PasswordInput = ({
    label,
    hint,
    placeholder,
    passwordrules,
    size = 'md',
    hideRequiredIndicator,
    ref,
    className,
    ...props
}: PasswordInputProps) => (
    <TextField
        aria-label={label ? undefined : placeholder}
        {...props}
        size={size}
        className={className}
    >
        {({ isRequired, isInvalid }) => (
            <>
                {label && (
                    <Label
                        isRequired={hideRequiredIndicator ? false : isRequired}
                        isInvalid={isInvalid}
                    >
                        {label}
                    </Label>
                )}

                <InputBase
                    ref={ref}
                    type="password"
                    size={size}
                    placeholder={placeholder}
                    passwordrules={passwordrules}
                />

                {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
            </>
        )}
    </TextField>
);

export default PasswordInput;
