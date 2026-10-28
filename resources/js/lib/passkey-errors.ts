import type { PasskeyError } from '@laravel/passkeys';

/**
 * Server messages laravel-lang doesn't translate yet. They can't be translated in
 * `lang/it.json`: `lang:update` puts laravel-lang's (English) values back.
 */
const serverMessages: Record<string, string> = {
    'Invalid credential format.': 'Formato della credenziale non valido.',
    'Passkey not recognized. It may have been removed from your account.':
        'Passkey non riconosciuta: potrebbe essere stata rimossa dal tuo account.',
    'Passkey registration session expired. Please try again.':
        'La sessione di registrazione della passkey è scaduta. Riprova.',
    'Passkey verification session expired. Please try again.':
        'La sessione di verifica della passkey è scaduta. Riprova.',
    'Unable to register passkey. Please try again.':
        'Impossibile registrare la passkey. Riprova.',
    'Unable to register this passkey.':
        'Impossibile registrare questa passkey.',
    'Unable to sign in with this account.':
        'Impossibile accedere con questo account.',
    'Unable to verify passkey. Please try again.':
        'Impossibile verificare la passkey. Riprova.',
};

/** The library's own generic messages, e.g. "Request failed with status 429". */
const isGenericLibraryMessage = (message: string): boolean =>
    message === 'An unknown error occurred.' ||
    message.startsWith('Request failed with status');

/**
 * The Italian message for an error from `@laravel/passkeys`. The library's errors are in
 * English, and so are a few server messages; anything else (e.g. validation) is already Italian.
 */
export const passkeyErrorMessage = (
    error: PasskeyError | null,
): string | null => {
    if (error === null) {
        return null;
    }

    switch (error.name) {
        case 'UserCancelledError':
            return 'Operazione annullata.';
        case 'NotSupportedError':
            return 'Le passkey non sono supportate da questo browser.';
        case 'PasskeyExistsError':
            return 'Questo dispositivo è già registrato come passkey.';
        case 'InvalidDomainError':
            return 'Le passkey non si possono usare su questo dominio.';
    }

    if (isGenericLibraryMessage(error.message)) {
        return 'Si è verificato un errore. Riprova.';
    }

    return serverMessages[error.message] ?? error.message;
};
