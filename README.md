# Mirai Core Base — Laravel + React + Untitled UI

## Introduzione

Questo repository è il **core base** di Mirai: la fondazione comune da cui partono tutti i progetti web. Raccoglie l'essenziale condiviso da ogni applicazione — autenticazione, shell UI, design system, ruoli/permessi con interfaccia e gestione utenti — già pronto e testato.

È costruito su [Inertia](https://inertiajs.com), che permette di realizzare SPA React moderne usando il routing e i controller server-side di Laravel: la produttività del backend Laravel unita alla potenza del frontend React e alla compilazione fulminea di Vite.

Stack: **Laravel 13** · **PHP 8.3+** · **Inertia v3** · **React 19** · **TypeScript** · **Tailwind CSS 4** · componenti [Untitled UI](https://www.untitledui.com/).

## Cosa include

- **Auth completo** (Fortify): login, registrazione, reset password, verifica email, 2FA, conferma password. Il primo utente registrato diventa automaticamente `admin`.
- **Ruoli & permessi con UI** ([spatie/laravel-permission](https://spatie.be/docs/laravel-permission)): CRUD ruoli, matrice permessi a checkbox, assegnazione ruoli all'utente. Il ruolo `admin` bypassa ogni check via `Gate::before`.
- **Gestione utenti**: CRUD con soft delete (disattivazione/riattivazione) e assegnazione ruoli nel form.
- **Navigazione filtrata per permessi**: la sidebar e le azioni mostrano solo ciò che l'utente può fare (permessi condivisi via Inertia).
- **Rotte come attributi** ([spatie/laravel-route-attributes](https://github.com/spatie/laravel-route-attributes)): i path sono dichiarati sui controller.
- **App shell** Untitled UI: sidebar, header, breadcrumbs, layout, design system.
- **Tooling**: Pint, Larastan, Rector, Pest/PHPUnit, Husky (pre-commit/pre-push), ESLint, Prettier.

## Getting Started

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

To start the development server:

```bash
composer run dev
```

This concurrently starts the Laravel server, queue worker, log viewer (Pail), and Vite dev server.

## Composer Packages

### nunomaduro/essentials [github](https://github.com/nunomaduro/essentials)
> Provides better defaults for your Laravel applications.

What it does:
- Strict Models
- Auto Eager Loading
- Optional Unguarded Models
- Immutable Dates
- Force HTTPS
- Safe Console
- Asset Prefetching
- Prevent Stray Requests
- Fake Sleep

### laravel/pint [github](https://github.com/laravel/pint)
> Laravel Pint is an opinionated PHP code style fixer for minimalists.

Code style fixer configured with `pint.json` file.

### rector-laravel [github](https://github.com/driftingly/rector-laravel)
> Rector instantly upgrades and refactors the PHP code of your application.

rector-laravel uses Rector and adds extra rules for Laravel. It automates upgrading your code to the latest version of PHP and Laravel and does auto-refactoring based on the rules in `rector.php`.

### phpstan and larastan [github](https://github.com/nunomaduro/larastan)
> Larastan focuses on finding errors in your code. It catches whole classes of bugs even before you write tests for the code.

Configured with `phpstan.neon`. This project uses level 6.

## Testing

This project uses PHPUnit for testing.

```bash
composer test              # Run full test suite (lint + tests)
php artisan test --compact # Run tests only
```

## Git Hooks (Pre-commit & Pre-push)

This project uses [Husky](https://typicode.github.io/husky/) to automate code quality checks before commits and pushes. These hooks ensure consistent code quality across the team.

### Pre-commit Hook

Runs automatically before every commit using [lint-staged](https://github.com/lint-staged/lint-staged). Only staged files are checked:

**For JavaScript/TypeScript files** (`resources/**/*.{ts,tsx,js,jsx}`):
- **Prettier**: Auto-formats code
- **ESLint**: Lints and auto-fixes issues

**For TypeScript files** (`resources/**/*.{ts,tsx}`):
- **TypeScript**: Type-checks without emitting files

**For PHP files** (`{app,bootstrap,config,database,routes,tests}/**/*.php`):
- **Pint**: Auto-formats code according to Laravel standards

**For PHP application files** (excluding tests):
- **PHPStan (Level 6)**: Static analysis to catch bugs

If any check fails, the commit will be blocked. Fix the issues and try again.

### Pre-push Hook

Runs automatically before every push:

1. **Test Suite** (`composer test`): Runs all tests
   - If tests fail, the push is blocked

2. **Rector Analysis** (`vendor/bin/rector process --dry-run`): Checks for potential refactoring improvements
   - If Rector suggests changes, you'll be prompted to continue or abort
   - Run `vendor/bin/rector process` to apply suggestions automatically

### Working with Git Hooks

#### Bypassing Hooks (Not Recommended)
If you absolutely need to bypass hooks:
```bash
git commit --no-verify -m "your message"
git push --no-verify
```

**Note**: Only bypass hooks if you understand the consequences. Your code may not meet quality standards.

#### Running Checks Manually

```bash
# Run lint-staged manually
npm run precommit

# Run individual checks
npm run format          # Format frontend code
npm run lint            # Lint frontend code
npm run types           # Check TypeScript types
vendor/bin/pint         # Format PHP code
vendor/bin/phpstan analyse  # Run PHPStan analysis

# Run test suite
composer test

# Run Rector
vendor/bin/rector process --dry-run  # Check suggestions
vendor/bin/rector process            # Apply suggestions
```

#### Setting Up Hooks (First Time)

Hooks are automatically installed when you run `npm install` (via the `prepare` script). If they're not working:

```bash
npm run prepare  # Reinstalls Husky hooks
```

### Configuration Files

| File | Purpose |
|------|---------|
| `.husky/pre-commit` | Pre-commit hook script |
| `.husky/pre-push` | Pre-push hook script |
| `.lintstagedrc.json` | Lint-staged configuration |
| `pint.json` | Pint (PHP formatter) rules |
| `phpstan.neon` | PHPStan static analysis config |
| `rector.php` | Rector refactoring rules |
| `eslint.config.js` | ESLint configuration |
| `.prettierrc` | Prettier configuration |
| `tsconfig.json` | TypeScript configuration |

## License

Il Mirai core base è software open-source rilasciato sotto licenza MIT.
