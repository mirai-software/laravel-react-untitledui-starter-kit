import type { ReactNode } from 'react';

type PageHeaderProps = {
    title: string;
    description?: string;
    actions?: ReactNode;
};

/** Title, description and main actions at the top of a page. */
const PageHeader = ({ title, description, actions }: PageHeaderProps) => (
    <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-primary lg:text-display-xs">
                {title}
            </h1>
            {description && (
                <p className="text-md text-tertiary">{description}</p>
            )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
);

export { PageHeader };
