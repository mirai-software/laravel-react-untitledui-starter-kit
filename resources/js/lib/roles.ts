/** Italian labels for the roles the kit creates; other roles show their own name. */
const roleLabels: Record<string, string> = {
    admin: 'Amministratore',
    user: 'Utente',
};

export const roleLabel = (name: string): string => roleLabels[name] ?? name;
