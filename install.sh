#!/usr/bin/env bash
#
# Primo avvio di un progetto nato dallo starter kit, senza PHP né Composer sul
# computer: installa le dipendenze Composer con un container Docker temporaneo,
# poi prepara l'app con Sail (container, chiave, database, asset).
# Si può rilanciare: salta i passaggi già fatti.
#
set -euo pipefail

# Posizionati nella cartella dello script (root del progetto).
cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
    echo "Errore: Docker non è installato o non è nel PATH." >&2
    exit 1
fi

if [ ! -f vendor/bin/sail ]; then
    # Non esiste un'immagine laravelsail/php85-composer: PHP 8.4 basta per
    # risolvere le dipendenze (il progetto richiede ^8.3); l'app gira poi
    # nel container Sail con PHP 8.5.
    echo "==> Installo le dipendenze Composer con un container Docker temporaneo..."
    docker run --rm \
        -u "$(id -u):$(id -g)" \
        -v "$(pwd):/var/www/html" \
        -w /var/www/html \
        laravelsail/php84-composer:latest \
        composer install --ignore-platform-reqs
fi

if [ ! -f .env ]; then
    echo "==> Creo .env da .env.example..."
    cp .env.example .env
fi

echo "==> Avvio i container (app + Postgres) e attendo che siano pronti..."
vendor/bin/sail up -d --wait

if ! grep -q '^APP_KEY=base64:' .env; then
    echo "==> Genero la chiave dell'applicazione..."
    vendor/bin/sail artisan key:generate
fi

echo "==> Eseguo le migrazioni..."
vendor/bin/sail artisan migrate --no-interaction

echo "==> Installo e compilo il frontend..."
vendor/bin/sail npm install
vendor/bin/sail npm run build

echo ""
echo "==> Fatto. Apri http://localhost (o la porta APP_PORT del tuo .env)."
echo "    Il primo utente che si registra diventa admin."
echo "    Per sviluppare con il ricaricamento automatico: vendor/bin/sail npm run dev"
