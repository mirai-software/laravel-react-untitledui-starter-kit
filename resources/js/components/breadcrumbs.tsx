import { Link } from '@inertiajs/react';
import { ChevronRight } from '@untitledui/icons';
import { Fragment } from 'react';
import type { BreadcrumbItem } from '@/types';

type BreadcrumbsProps = {
    breadcrumbs: BreadcrumbItem[];
};

const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) =>
    breadcrumbs.length > 0 ? (
        <nav aria-label="Percorso">
            <ol className="flex items-center gap-1.5 text-sm">
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                        <Fragment key={index}>
                            <li>
                                {isLast ? (
                                    <span
                                        aria-current="page"
                                        className="font-semibold text-secondary"
                                    >
                                        {item.title}
                                    </span>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="rounded-xs font-medium text-tertiary outline-focus-ring transition duration-100 ease-linear hover:text-tertiary_hover focus-visible:outline-2 focus-visible:outline-offset-2"
                                    >
                                        {item.title}
                                    </Link>
                                )}
                            </li>
                            {!isLast && (
                                <ChevronRight className="size-4 text-fg-quaternary" />
                            )}
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    ) : null;

export { Breadcrumbs };
