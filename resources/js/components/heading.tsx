type HeadingProps = {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
};

const Heading = ({ title, description, variant = 'default' }: HeadingProps) => (
    <header
        className={
            variant === 'small'
                ? 'flex flex-col gap-1'
                : 'mb-8 flex flex-col gap-1'
        }
    >
        <h2
            className={
                variant === 'small'
                    ? 'text-md font-semibold text-primary'
                    : 'text-lg font-semibold text-primary'
            }
        >
            {title}
        </h2>
        {description && <p className="text-sm text-tertiary">{description}</p>}
    </header>
);

export default Heading;
