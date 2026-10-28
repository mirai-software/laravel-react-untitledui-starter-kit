# Mirai Starter Kit — Laravel + React + Untitled UI

Lo starter kit interno del team: la base da cui partono i nostri progetti web. È lo [starter kit React ufficiale di Laravel](https://github.com/laravel/react-starter-kit) con l'interfaccia rifatta in [Untitled UI](https://www.untitledui.com/react) e le funzionalità che servono in ogni progetto: ruoli e permessi, gestione utenti, interfaccia e messaggi in italiano.

**Indice:** [Stack](#stack) · [Cosa aggiunge](#cosa-aggiunge-allo-starter-kit-ufficiale) · [Nuovo progetto](#nuovo-progetto) · [Utenti, ruoli e permessi](#utenti-ruoli-e-permessi) · [Sviluppo quotidiano](#sviluppo-quotidiano) · [Messa online](#messa-online) · [Aggiornamenti](#aggiornamenti) · [Componenti Untitled UI](#componenti-untitled-ui) · [Traduzioni](#traduzioni) · [Disattivare una funzione di accesso](#disattivare-una-funzione-di-accesso)

## Stack

|          |                                                                              |
| -------- | ---------------------------------------------------------------------------- |
| Backend  | PHP 8.5 (Sail) · Laravel 13 · Fortify · Inertia 3 · Wayfinder                |
| Frontend | React 19 · TypeScript · Tailwind CSS 4 · Untitled UI v8 (React Aria) · Vite+ |
| Database | Postgres 18 in sviluppo (Sail); SQLite in memoria per test e CI              |
| Permessi | spatie/laravel-permission 8                                                  |
| Qualità  | Pint · Larastan · PHPUnit 12 · Vite+ (formattazione e lint) · `tsc`          |
| AI       | Laravel Boost (via Sail) · `AGENTS.md` con le convenzioni del team           |

## Cosa aggiunge allo starter kit ufficiale

- **Interfaccia Untitled UI v8** al posto di shadcn/ui, con il tema e i colori del brand Mirai (corallo, `#D97757`), font Inter, tema chiaro e scuro.
- **Ruoli e permessi** con interfaccia: ruoli con la loro matrice dei permessi; il ruolo `admin` supera ogni controllo; la sidebar mostra solo ciò che l'utente può fare.
- **Gestione utenti**: creazione, modifica, disattivazione e riattivazione. Solo un admin assegna i ruoli, e nessuno gestisce un account con più permessi dei suoi.
- **Amministratori creati da terminale** con `php artisan app:create-admin`: chi si registra riceve sempre il ruolo `user`.
- **Italiano ovunque**: interfaccia, messaggi di validazione e autenticazione, email ([laravel-lang](https://laravel-lang.com)).
- **Pagine di errore** in italiano (403, 404, 429, 500, 503); una pagina scaduta (419) torna indietro con un avviso, senza perdere il form.
- **Branding Mirai** nella pagina di benvenuto e nelle pagine di accesso.
- **Impostazioni più rigide** con [nunomaduro/essentials](https://github.com/nunomaduro/essentials) (`config/essentials.php`): modelli Eloquent strict fuori produzione, HTTPS forzato in produzione, nessuna richiesta HTTP vera nei test.
- **Setup per Claude Code**: `AGENTS.md` (linee guida di Boost e convenzioni del team) con `CLAUDE.md` come link simbolico, skill e server MCP di Boost che girano dentro Sail.

Tutto ciò che offre lo starter kit ufficiale resta: login, registrazione, reset password, verifica email, 2FA, passkey, conferma password, impostazioni di profilo e sicurezza.

## Nuovo progetto

Serve solo **Docker**: PHP, Composer e Node girano nei container di [Sail](https://laravel.com/docs/sail).

1. **Crea il repository** del progetto da questo kit ("Use this template" su GitHub) e clonalo. Se vuoi ricevere gli aggiornamenti del kit, collegalo (vedi [Collegare il progetto al kit](#collegare-il-progetto-al-kit)).
2. **Se hai già un altro progetto Sail avviato**, le porte 80, 5173 e 5432 sono occupate. Prima del passo successivo copia `.env.example` in `.env` e imposta, togliendo il `#`, `APP_PORT`, `VITE_PORT` e `FORWARD_DB_PORT`, con l'`APP_URL` corrispondente (es. `http://localhost:8080`: le passkey funzionano solo su quell'indirizzo).
3. **Installa**, nella cartella del progetto:

    ```bash
    ./install.sh
    ```

    Lo script installa le dipendenze Composer con un container Docker temporaneo, crea `.env` da `.env.example`, avvia i container (app e Postgres), genera la chiave, esegue migrazioni e seeder (ruoli e permessi), installa e compila il frontend. La prima volta Docker scarica e costruisce le immagini: qualche minuto. Si può rilanciare: salta i passaggi già fatti, e se si è fermato per una porta occupata riprende da lì.

4. **Crea il tuo account amministratore:**

    ```bash
    vendor/bin/sail artisan app:create-admin
    ```

    Chiede email, nome e password, e crea un admin con l'email già verificata. Poi apri l'indirizzo di `APP_URL` (di solito `http://localhost`) e accedi.

**Da sapere:**

- Le email non partono davvero (`MAIL_MAILER=log`): finiscono nel log, da leggere con `vendor/bin/sail artisan pail` o in `storage/logs/laravel.log`. Per vederle in un'interfaccia web si può aggiungere Mailpit con `vendor/bin/sail artisan sail:add mailpit`.
- Composer avvisa che tre pacchetti `dragon-code/*` sono abbandonati: li usa [laravel-lang](https://laravel-lang.com), che serve solo in sviluppo per aggiornare le traduzioni. Non hanno vulnerabilità note e non vengono installati in produzione: l'avviso si può ignorare.

### Collegare il progetto al kit

"Use this template" crea il progetto con un solo commit, senza la storia del kit: così com'è, il progetto non può ricevere gli aggiornamenti del kit con un merge. Questi comandi, da lanciare una volta sola nella cartella del progetto, cercano la versione del kit con gli stessi file del primo commit del progetto e la segnano come già inclusa; non cambiano nessun file. Si possono lanciare anche più tardi, non solo subito dopo la creazione.

```bash
git remote add kit git@github.com:mirai-software/laravel-react-untitledui-starter-kit.git
git fetch kit
ROOT_TREE=$(git rev-parse "$(git rev-list --max-parents=0 HEAD)^{tree}")
KIT_COMMIT=$(git log kit/main --format='%H %T' | awk -v t="$ROOT_TREE" '$2 == t { print $1; exit }')
echo "Versione del kit: ${KIT_COMMIT:-non trovata}"
[ -n "$KIT_COMMIT" ] && git merge -s ours --allow-unrelated-histories -m "Collega il progetto allo starter kit" "$KIT_COMMIT"
```

Se la versione non viene trovata (per esempio perché il progetto è stato creato a mano), prendi l'ultimo commit del kit prima della creazione del progetto, mettendo data e ora al posto di quelle d'esempio, e rilancia l'ultima riga: `KIT_COMMIT=$(git log kit/main --before="2026-11-03 18:00" -1 --format=%H)`. Da quel momento il progetto si aggiorna con `git merge kit/main` (vedi [Aggiornamenti](#aggiornamenti)).

### Da personalizzare in ogni progetto

- `.env.example`: `APP_NAME` e `MAIL_FROM_ADDRESS` (è il file che copiano i colleghi e la CI).
- `composer.json`: `name`, `description` e `license`; `package.json`: `name` (poi `vendor/bin/sail npm install` per aggiornare `package-lock.json`).
- Questo README: titolo e descrizione del progetto.
- Il logo (`resources/js/components/app-logo-icon.tsx`) e le favicon in `public/`, che sono ancora quelli di Laravel.
- I colori del brand in `resources/css/app.css`, se il progetto non usa quelli Mirai, e il testo del pannello di accesso in `resources/js/layouts/auth/auth-split-layout.tsx`.

## Utenti, ruoli e permessi

- **Gli admin si creano solo da terminale**, con `php artisan app:create-admin`, in locale come in produzione. Con l'email di un utente che esiste già, il comando lo rende admin dopo una conferma, riattivandolo se era disattivato: serve anche a recuperare l'accesso se l'ultimo admin è stato disattivato.
- **Chi si registra** dal sito riceve il ruolo `user` e deve verificare l'email.
- **Ruoli e permessi** li creano le migrazioni, quindi esistono in ogni ambiente dopo `migrate`, produzione compresa. Quelli del kit stanno in `create_default_roles_and_permissions` (`database/migrations`); i permessi nuovi di un progetto si aggiungono con una nuova migrazione, scritta a mano. Come aggiungere una sezione con i suoi permessi è spiegato in [`AGENTS.md`](AGENTS.md).
- **Regole che valgono per tutti:** solo un admin assegna i ruoli; nessuno gestisce un account con più permessi dei suoi; un admin non può togliersi il ruolo admin; l'ultimo admin non può eliminare il proprio account.
- **Disattivare un utente** (o usare "Elimina account" nelle impostazioni) non cancella i dati: l'account si può riattivare.

## Sviluppo quotidiano

Avvia i container, poi Vite con il ricaricamento automatico; a fine giornata ferma i container:

```bash
vendor/bin/sail up -d
vendor/bin/sail npm run dev
vendor/bin/sail stop
```

Tutti i comandi PHP, Artisan, Composer e Node passano da `vendor/bin/sail`.

Prima di ogni commit, le stesse verifiche che esegue la CI su GitHub (`composer ci:check`):

```bash
vendor/bin/sail composer test
vendor/bin/sail npm run check
vendor/bin/sail npm run types:check
```

Il primo esegue Pint, PHPStan e i test; il secondo formattazione e lint (Vite+); il terzo il controllo dei tipi TypeScript.

Le convenzioni del team (componenti come arrow function, niente `any`, rotte via Wayfinder, permessi, rotte come attributi solo sui nostri controller, ecc.) sono in [`AGENTS.md`](AGENTS.md), che è anche il file letto da Claude Code (tramite `CLAUDE.md`).

## Messa online

Cosa serve al kit in produzione, oltre al deploy abituale di Laravel (dipendenze, `php artisan optimize`, frontend compilato con `npm run build`):

- **PHP:** solo versioni con le correzioni di sicurezza, oggi `~8.4.27 || ^8.5.12` (vedi [PHP](#php)). Su una versione vulnerabile `composer install` si rifiuta di installare.
- **`.env`:** `APP_ENV=production`, `APP_DEBUG=false` (così compaiono le pagine di errore in italiano), `APP_URL` con `https://` (lo usano i link delle email e le passkey; in produzione HTTPS è forzato), e un mailer vero (`MAIL_*`) per la verifica dell'email e il reset della password.
- **A ogni deploy:** `php artisan migrate --force`, come fa già lo script di deploy di Forge: crea anche i permessi aggiunti nel frattempo.
- **La prima volta:** `php artisan app:create-admin` per il primo admin.

## Aggiornamenti

Le dipendenze (Laravel, Inertia, React, Untitled UI…) si aggiornano in ogni progetto con `vendor/bin/sail composer update` e `vendor/bin/sail npm update`. Gli aggiornamenti dal kit riguardano invece il codice copiato nel progetto: pagine, componenti, ruoli e utenti, configurazione.

**Unire sempre con un merge commit.** Il collegamento con lo starter kit ufficiale (nel kit) e con il kit (nei progetti) sta nella storia git. Per questo una pull request verso `main` del kit, o una che porta in un progetto gli aggiornamenti del kit, si unisce con "Create a merge commit". "Squash and merge" e "Rebase and merge" riscrivono la storia: il collegamento si perde e l'aggiornamento successivo va in conflitto quasi ovunque. Nel repository del kit squash e rebase sono disattivati (Settings → General → Pull Requests); nei progetti conviene fare lo stesso.

### In un progetto: dal kit

Il kit integra gli aggiornamenti dello starter kit ufficiale di Laravel, quindi un progetto collegato al kit (vedi [Collegare il progetto al kit](#collegare-il-progetto-al-kit)) li riceve tutti da lì, insieme alle correzioni del kit; non serve aggiungere anche lo starter kit ufficiale come remote.

```bash
git fetch kit
git merge kit/main
```

Git applica solo le modifiche del kit successive alla versione da cui è nato il progetto (o all'ultimo merge). I file che il progetto ha cambiato negli stessi punti vanno in conflitto: lì si sceglie a mano. Dopo il merge valgono le stesse regole del kit qui sotto (lock, verifiche, giro nel browser). Più il progetto si allontana dal kit, più i merge diventano impegnativi: conviene farli spesso nei primi mesi, e poi soprattutto per correzioni mirate.

### Nel repository del kit: dallo starter kit ufficiale

Il kit è collegato alla storia git dello starter kit ufficiale, quindi gli aggiornamenti di Laravel si integrano con un merge (il `git remote add` serve una volta sola):

```bash
git remote add upstream https://github.com/laravel/react-starter-kit.git
git fetch upstream
git merge upstream/main
```

Git applica solo le modifiche arrivate dopo l'ultimo collegamento (un merge "-s ours" che segna cosa è già incluso). Cosa aspettarsi:

- le modifiche al backend (config, Fortify, modelli, test) di solito si integrano da sole;
- le pagine e i componenti riscritti in Untitled UI vanno in conflitto o non ricevono le modifiche dell'interfaccia: lì la modifica di upstream va riportata a mano;
- upstream non versiona `composer.lock` e `package-lock.json`, noi sì: se il merge cambia `composer.json` o `package.json`, aggiorna i lock (`vendor/bin/sail composer update <pacchetti>`, `vendor/bin/sail npm install`) e committali;
- i file shadcn nuovi di upstream (`components/ui/*` o pagine che li usano) arrivano senza conflitti ma importano pacchetti che abbiamo tolto: vanno convertiti in Untitled UI o eliminati;
- i file che abbiamo eliminato (es. `components/ui/*`) danno un conflitto "modificato da upstream, eliminato da noi": si risolve con `git rm`;
- dopo il merge: tutte le verifiche di [Sviluppo quotidiano](#sviluppo-quotidiano) e un giro nel browser.

Per lo stesso motivo conviene restare vicini a upstream: file nuovi invece di modifiche ai file di upstream, stile Pint di default, rotte di upstream nei file `routes/*.php`.

### PHP

`composer.json` accetta solo versioni di PHP con le correzioni di sicurezza (oggi `~8.4.27 || ^8.5.12`, le correzioni di php2shell). Quando esce una nuova correzione di sicurezza, alza questi minimi e aggiorna PHP sui server; in locale `vendor/bin/sail build --no-cache` e poi `vendor/bin/sail up -d` ricostruiscono il container con l'ultima versione.

## Componenti Untitled UI

I componenti in `resources/js/components/{base,application,foundations}` e `resources/js/utils/` vengono dalla [CLI di Untitled UI](https://www.untitledui.com/react/docs/cli) e restano come consegnati (sono esclusi da formattazione e lint di Vite+): si personalizzano con i token del tema e con componenti nostri che li avvolgono. Il tema (`resources/css/theme.css`) è quello di Untitled UI senza modifiche; i colori del brand stanno in `resources/css/app.css`. Non usare `untitledui init`: il tema è già configurato.

Il kit contiene solo i componenti usati. Per aggiungerne o aggiornarne uno:

```bash
vendor/bin/sail npx -y untitledui@latest add <componente> -t base -p resources/js/components --lib-version 8 --yes
```

Per i componenti "application" usa `-t application`; per aggiornare un componente già presente aggiungi `-o` (sovrascrive). La CLI non conosce la struttura di Laravel: dopo `add`, sposta helper e hook nelle cartelle giuste e correggi gli import (su Linux `sed -i` invece di `sed -i ''`):

```bash
mkdir -p resources/js/utils && [ -d utils ] && mv utils/* resources/js/utils/ && rmdir utils
[ -d hooks ] && mv hooks/* resources/js/hooks/ && rmdir hooks
grep -rl "@/resources/js/" resources/js | xargs sed -i '' 's#@/resources/js/#@/#g'
```

La CLI aggiunge anche i file vicini e tutto ciò che importano (per esempio `add input` riporta tutte le varianti di input e decine di icone di pagamento) e può reinstallare pacchetti npm. Dopo `add`, guarda `git status` e `git diff package.json`: tieni solo i file che il nostro codice importa, direttamente o tramite altri file tenuti, e togli il resto; `vendor/bin/sail npm run types:check` e `vendor/bin/sail npm run build` segnalano se hai tolto troppo. Se la CLI aggiunge un hook in `resources/js/hooks/`, aggiungilo anche alle esclusioni di Vite+ in `vite.config.ts`.

## Traduzioni

I testi dell'interfaccia sono scritti direttamente in italiano. I messaggi di Laravel (validazione, autenticazione, email) vengono da [laravel-lang](https://laravel-lang.com) in `lang/it` e `lang/it.json`; per aggiornarli:

```bash
vendor/bin/sail artisan lang:update
```

Le chiavi nostre passate a `__()` vanno aggiunte a `lang/it.json` (`lang:update` le mantiene).

## Disattivare una funzione di accesso

Registrazione, verifica email, 2FA, passkey e conferma password sono tutte attive. Lo starter kit ufficiale le sceglie all'installazione, cancellando il codice di quelle non volute; qui sono già installate tutte, quindi per toglierne una **non basta toglierla da `config/fortify.php`**: le pagine importano le sue rotte, e senza le rotte il frontend non compila più. Per ogni funzione:

1. Nei file PHP, togli i blocchi tra i commenti `/* @chisel-<funzione> */` e `/* @end-chisel-<funzione> */`. Le funzioni si chiamano `registration`, `email-verification`, `2fa`, `passkeys`, `password-confirmation`; per trovarli: `grep -rn "chisel-registration" app config routes database tests`.
2. Cancella e modifica i file elencati qui sotto (le pagine riscritte in Untitled UI non hanno i commenti). I percorsi senza cartella sono in `resources/js/`.
3. `vendor/bin/sail artisan wayfinder:generate --with-form`, poi le verifiche di [Sviluppo quotidiano](#sviluppo-quotidiano).

**Registrazione**

- Da cancellare: `app/Actions/Fortify/CreateNewUser.php`, `pages/auth/register.tsx`, `tests/Feature/Auth/RegistrationTest.php` e `RegistrationRoleTest.php`.
- Da modificare: `pages/auth/login.tsx` (link "Registrati"), `pages/welcome.tsx` (pulsante "Registrati").

**Verifica email**

- Da cancellare: `pages/auth/verify-email.tsx`, `tests/Feature/Auth/EmailVerificationTest.php` e `VerificationNotificationTest.php`.
- Da modificare: `app/Models/User.php` (togli `MustVerifyEmail`), `pages/settings/profile.tsx` (avviso "email non verificata").

**2FA**

- Da cancellare: `pages/auth/two-factor-challenge.tsx`, `components/manage-two-factor.tsx`, `two-factor-setup-modal.tsx`, `two-factor-recovery-codes.tsx`, `hooks/use-two-factor-auth.ts`, `components/base/input/pin-input.tsx`, la migrazione `add_two_factor_columns_to_users_table`, `tests/Feature/Auth/TwoFactorChallengeTest.php`, e il pacchetto npm `input-otp`.
- Da modificare: `app/Models/User.php` (togli `TwoFactorAuthenticatable`), `pages/settings/security.tsx` (sezione 2FA).

**Passkey**

- Da cancellare: `components/manage-passkeys.tsx`, `passkey-item.tsx`, `passkey-register.tsx`, `passkey-verify.tsx`, `lib/passkey-errors.ts`, `app/Models/Passkey.php`, la migrazione `create_passkeys_table`, e il pacchetto npm `@laravel/passkeys`.
- Da modificare: `app/Models/User.php` (togli `PasskeyAuthenticatable` e `PasskeyUser`), `app/Providers/AppServiceProvider.php` (`configurePasskeys()`), `pages/settings/security.tsx`, `pages/auth/login.tsx` e `confirm-password.tsx` (pulsante passkey), `tests/Feature/Users/UserManagementTest.php` (test sulle passkey).

**Conferma password**

- Da cancellare: `pages/auth/confirm-password.tsx`, `tests/Feature/Auth/PasswordConfirmationTest.php`.
- Da modificare: `config/fortify.php` (`'confirmPassword' => false` per 2FA e passkey).

Se togli sia la 2FA sia le passkey, in `pages/settings/security.tsx` resta solo il cambio password.
