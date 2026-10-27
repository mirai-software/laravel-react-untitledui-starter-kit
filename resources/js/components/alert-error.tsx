import { AlertCircle } from '@untitledui/icons';

type AlertErrorProps = {
    errors: string[];
    title?: string;
};

const AlertError = ({ errors, title }: AlertErrorProps) => (
    <div
        role="alert"
        className="flex w-full gap-3 rounded-xl bg-primary p-4 shadow-xs ring-1 ring-error_subtle ring-inset"
    >
        <AlertCircle className="size-5 shrink-0 text-fg-error-primary" />
        <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-primary">
                {title ?? 'Qualcosa è andato storto.'}
            </p>
            <ul className="list-inside list-disc text-sm text-tertiary">
                {Array.from(new Set(errors)).map((error) => (
                    <li key={error}>{error}</li>
                ))}
            </ul>
        </div>
    </div>
);

export default AlertError;
