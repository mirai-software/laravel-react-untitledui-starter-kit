import { AlertCircle } from '@untitledui/icons';

export default function AlertError({
    errors,
    title,
}: {
    errors: string[];
    title?: string;
}) {
    return (
        <div className="border-error-300 bg-error-25 dark:border-error-500/30 dark:bg-error-950 rounded-lg border p-4">
            <div className="flex gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-fg-error-primary" />
                <div className="space-y-1">
                    <p className="text-error-700 dark:text-error-400 text-sm font-medium">
                        {title || 'Something went wrong.'}
                    </p>
                    <ul className="text-error-600 dark:text-error-400 list-inside list-disc text-sm">
                        {Array.from(new Set(errors)).map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
