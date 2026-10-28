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
    # Serve Sail per avviare i container, ma Sail si installa con Composer: l'immagine
    # ufficiale di Composer scarica i pacchetti del composer.lock (ignorando le estensioni
    # PHP che lì mancano) senza eseguirne gli script; gli script girano più sotto con
    # "sail composer install", nel container di Sail.
    echo "==> Scarico le dipendenze Composer con un container Docker temporaneo..."
    docker run --rm \
        -u "$(id -u):$(id -g)" \
        -v "$(pwd):/app" \
        -w /app \
        -e COMPOSER_HOME=/tmp/composer \
        composer:2 \
        composer install --ignore-platform-reqs --no-scripts
fi

if [ ! -f .env ]; then
    echo "==> Creo .env da .env.example..."
    cp .env.example .env
fi

echo "==> Avvio i container (app + Postgres) e attendo che siano pronti..."
echo "    (la prima volta Docker costruisce l'immagine di Sail: qualche minuto)"
if ! vendor/bin/sail up -d --wait; then
    echo "" >&2
    echo "Errore: i container non sono partiti. Se una porta è già occupata da un altro" >&2
    echo "progetto, imposta APP_PORT, VITE_PORT o FORWARD_DB_PORT (e APP_URL) in .env" >&2
    echo "e rilancia ./install.sh." >&2
    exit 1
fi

# Completa l'installazione nel container (script dei pacchetti compresi); se una
# esecuzione precedente si è interrotta, sistema anche le dipendenze mancanti.
echo "==> Completo l'installazione delle dipendenze Composer..."
vendor/bin/sail composer install --no-interaction

if ! grep -q '^APP_KEY=base64:' .env; then
    echo "==> Genero la chiave dell'applicazione..."
    vendor/bin/sail artisan key:generate
fi

echo "==> Eseguo le migrazioni (creano anche ruoli e permessi)..."
vendor/bin/sail artisan migrate --no-interaction

echo "==> Installo e compilo il frontend..."
vendor/bin/sail npm install
vendor/bin/sail npm run build

echo ""
APP_URL=$(grep '^APP_URL=' .env | cut -d= -f2- || true)
echo "==> Fatto. Apri ${APP_URL:-http://localhost}."
echo "    Crea il tuo account amministratore: vendor/bin/sail artisan app:create-admin"
echo "    Le email (es. la verifica) finiscono nel log: vendor/bin/sail artisan pail"
echo "    Per sviluppare con il ricaricamento automatico: vendor/bin/sail npm run dev"
