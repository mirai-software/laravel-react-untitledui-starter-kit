import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from '@untitledui/icons';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/base/buttons/button';
import { dashboard, home } from '@/routes';

type ErrorPageProps = {
    status: number;
};

const messages: Record<number, { title: string; description: string }> = {
    403: {
        title: 'Accesso negato',
        description: 'Non hai i permessi per accedere a questa pagina.',
    },
    404: {
        title: 'Pagina non trovata',
        description: 'La pagina che cerchi non esiste o è stata spostata.',
    },
    429: {
        title: 'Troppe richieste',
        description:
            'Hai fatto troppe richieste in poco tempo. Attendi qualche istante e riprova.',
    },
    500: {
        title: 'Errore del server',
        description: 'Si è verificato un errore imprevisto. Riprova più tardi.',
    },
    503: {
        title: 'Servizio non disponibile',
        description: 'Stiamo facendo manutenzione. Torna a trovarci tra poco.',
    },
};

/** Rendered by `configureErrorPages()` in `AppServiceProvider` when debug is off. */
const ErrorPage = ({ status }: ErrorPageProps) => {
    const { title, description } = messages[status] ?? messages[500];
    const { auth } = usePage().props;
    const homeUrl = auth.user ? dashboard().url : home().url;

    // With no page to go back to (e.g. a link opened in a new tab), go to the home page instead.
    const goBack = (): void => {
        if (window.history.length > 1) {
            window.history.back();

            return;
        }

        router.visit(homeUrl);
    };

    return (
        <>
            <Head title={title} />

            <main className="flex min-h-svh flex-col items-center justify-center bg-primary px-4 py-16 text-center">
                <AppLogoIcon className="size-10 fill-current text-fg-brand-primary" />
                <p className="mt-8 text-md font-semibold text-brand-secondary">
                    Errore {status}
                </p>
                <h1 className="mt-3 text-display-md font-semibold text-primary md:text-display-lg">
                    {title}
                </h1>
                <p className="mt-4 max-w-md text-lg text-tertiary md:text-xl">
                    {description}
                </p>
                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
                    <Button
                        color="secondary"
                        size="lg"
                        iconLeading={ArrowLeft}
                        onPress={goBack}
                    >
                        Torna indietro
                    </Button>
                    <Button href={homeUrl} size="lg">
                        {auth.user ? 'Vai alla dashboard' : 'Vai alla home'}
                    </Button>
                </div>
            </main>
        </>
    );
};

export default ErrorPage;
