# Mirai Starter Kit — Laravel + React + Untitled UI

Lo starter kit interno del team: la base da cui partono i nostri progetti web. È lo [starter kit React ufficiale di Laravel](https://github.com/laravel/react-starter-kit) con l'interfaccia rifatta in [Untitled UI](https://www.untitledui.com/react) e le funzionalità che servono in ogni progetto: ruoli e permessi, gestione utenti, interfaccia e messaggi in italiano.

## Stack

|          |                                                                              |
| -------- | ---------------------------------------------------------------------------- |
| Backend  | PHP 8.5 (Sail) · Laravel 13 · Fortify · Inertia 3 · Wayfinder                |
| Frontend | React 19 · TypeScript · Tailwind CSS 4 · Untitled UI v8 (React Aria) · Vite+ |
| Database | Postgres 18 in sviluppo (Sail); SQLite in memoria per i test                 |
| Permessi | spatie/laravel-permission 8                                                  |
| Qualità  | Pint · Larastan · PHPUnit 12 · Vite+ (formattazione e lint) · `tsc`          |
| AI       | Laravel Boost (via Sail) · `AGENTS.md` con le convenzioni del team           |

## Cosa aggiunge allo starter kit ufficiale

- **Interfaccia Untitled UI v8** al posto di shadcn/ui, con il tema e i colori del brand Mirai (corallo, `#D97757`), font Inter, tema chiaro/scuro.
- **Ruoli e permessi** con interfaccia (CRUD ruoli, matrice dei permessi). Il ruolo `admin` supera ogni controllo; la sidebar mostra solo ciò che l'utente può fare.
- **Gestione utenti**: creazione, modifica, disattivazione (soft delete) e riattivazione. Anche "Elimina account" nelle impostazioni disattiva soltanto.
- **Il primo utente che si registra diventa `admin`**, i successivi `user`.
- **Italiano ovunque**: interfaccia, messaggi di validazione e autenticazione, email ([laravel-lang](https://laravel-lang.com)).
- **Pagine di errore** (403, 404, 419, 429, 500, 503) in stile Untitled UI, in italiano.
- **Branding Mirai** nella pagina di benvenuto e nelle pagine di accesso.
- **Setup per Claude Code**: `AGENTS.md` (linee guida Boost + convenzioni del team) con `CLAUDE.md` come link simbolico, skill e server MCP di Boost che girano dentro Sail.

Tutto ciò che offre lo starter kit ufficiale resta: login, registrazione, reset password, verifica email, 2FA, passkey, conferma password, impostazioni profilo e sicurezza.

## Nuovo progetto

Serve solo **Docker**: PHP, Composer e Node girano nei container di [Sail](https://laravel.com/docs/sail).

1. Crea il repository del progetto da questo kit ("Use this template" su GitHub) e clonalo.
2. Nella cartella del progetto lancia:

    ```bash
    ./install.sh
    ```

    Lo script installa le dipendenze Composer con un container Docker temporaneo, crea `.env` da `.env.example`, avvia i container (app + Postgres), genera la chiave, esegue le migrazioni, installa e compila il frontend. Si può rilanciare: salta i passaggi già fatti.

3. Apri `http://localhost` e registrati: **il primo utente diventa admin**.

Prima di iniziare, in `.env` imposta almeno `APP_NAME`. Se le porte 80, 5173 o 5432 sono già occupate da un altro progetto, cambia `APP_PORT`, `VITE_PORT` o `FORWARD_DB_PORT`.

Il logo (`resources/js/components/app-logo-icon.tsx`) e le favicon in `public/` sono ancora quelli di Laravel: sostituiscili con quelli del progetto.

### Utente di prova e admin

- Ruoli e permessi li crea una migrazione, quindi esistono in ogni ambiente dopo `migrate`. I permessi nuovi di un progetto si aggiungono con altre migrazioni.
- `vendor/bin/sail artisan db:seed` aggiunge un utente di prova admin (`test@example.com`, password `password`). **Solo per lo sviluppo in locale, mai in produzione.**
- Solo un admin può assegnare il ruolo admin, e l'ultimo admin non può eliminare il proprio account. Per rendere admin un utente da terminale (anche se è disattivato, lo riattiva):

    ```bash
    vendor/bin/sail artisan tinker --execute '$user = App\Models\User::withTrashed()->where("email", "nome@esempio.it")->firstOrFail(); $user->restore(); $user->assignRole("admin");'
    ```

## Sviluppo quotidiano

```bash
vendor/bin/sail up -d          # avvia i container
vendor/bin/sail npm run dev    # Vite con ricaricamento automatico
vendor/bin/sail stop           # ferma i container
```

Tutti i comandi PHP, Artisan, Composer e Node passano da `vendor/bin/sail`.

Prima di ogni commit (le stesse verifiche che esegue la CI su GitHub, `composer ci:check`):

```bash
vendor/bin/sail composer test        # Pint, PHPStan e test
vendor/bin/sail npm run check        # formattazione e lint (Vite+)
vendor/bin/sail npm run types:check  # TypeScript
```

Le convenzioni del team (componenti come arrow function, niente `any`, rotte via Wayfinder, permessi, rotte come attributi solo sui nostri controller, ecc.) sono in [`AGENTS.md`](AGENTS.md), che è anche il file letto da Claude Code (tramite `CLAUDE.md`).

## Restare aggiornati con lo starter kit ufficiale

Il kit è collegato alla storia git dello starter kit ufficiale, quindi gli aggiornamenti di Laravel si integrano con un merge:

```bash
git remote add upstream https://github.com/laravel/react-starter-kit.git   # una volta sola
git fetch upstream
git merge upstream/main
```

Git applica solo le modifiche arrivate dopo l'ultimo collegamento (un merge "-s ours" che segna cosa è già incluso). Cosa aspettarsi:

- le modifiche al backend (config, Fortify, modelli, test) di solito si integrano da sole;
- le pagine e i componenti riscritti in Untitled UI vanno in conflitto o non ricevono le modifiche dell'interfaccia: lì la modifica di upstream va riportata a mano;
- dopo il merge: tutte le verifiche qui sopra e un giro nel browser.

Per lo stesso motivo conviene restare vicini a upstream: file nuovi invece di modifiche ai file di upstream, stile Pint di default, rotte di upstream nei file `routes/*.php`.

## Componenti Untitled UI

I componenti in `resources/js/components/{base,application,foundations}` e `resources/js/utils/` vengono dalla [CLI di Untitled UI](https://www.untitledui.com/react/docs/cli) e restano come consegnati (sono esclusi da formattazione e lint di Vite+): si personalizzano con i token del tema e con componenti nostri che li avvolgono. Il kit contiene solo i componenti usati; per aggiungerne o aggiornarne uno:

```bash
vendor/bin/sail npx -y untitledui@latest add <componente> -t base -p resources/js/components --lib-version 8 --yes
# -t application per i componenti "application"; -o per sovrascrivere (aggiornare)

# la CLI non conosce la struttura di Laravel: sistema dove mette helper, hook e import
mkdir -p resources/js/utils && [ -d utils ] && mv utils/* resources/js/utils/ && rmdir utils
[ -d hooks ] && mv hooks/* resources/js/hooks/ && rmdir hooks
grep -rl "@/resources/js/" resources/js | xargs sed -i '' 's#@/resources/js/#@/#g'   # macOS; su Linux: sed -i
```

Se la CLI aggiunge un hook in `resources/js/hooks/`, aggiungilo anche alle esclusioni di Vite+ in `vite.config.ts`. Non usare `untitledui init`: il tema (`resources/css/theme.css`, con i colori Mirai) è già configurato.

## Traduzioni

I testi dell'interfaccia sono scritti direttamente in italiano. I messaggi di Laravel (validazione, autenticazione, email) vengono da [laravel-lang](https://laravel-lang.com) in `lang/it` e `lang/it.json`; per aggiornarli:

```bash
vendor/bin/sail artisan lang:update
```

Le chiavi nostre passate a `__()` vanno aggiunte a `lang/it.json` (`lang:update` le mantiene).
