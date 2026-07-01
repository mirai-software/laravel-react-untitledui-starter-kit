#!/usr/bin/env bash
#
# Bootstrap delle dipendenze Composer senza avere PHP/Composer installati
# localmente: usa un container Docker temporaneo (PHP 8.4 + Composer).
# Necessario solo al primo avvio, quando la cartella vendor/ non esiste
# ancora e quindi vendor/bin/sail non è disponibile.
#
set -euo pipefail

# Posizionati nella cartella dello script (root del progetto).
cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
    echo "Errore: Docker non è installato o non è nel PATH." >&2
    exit 1
fi

echo "==> Installazione dipendenze Composer via container Docker (PHP 8.4)..."
docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v "$(pwd):/var/www/html" \
    -w /var/www/html \
    laravelsail/php84-composer:latest \
    composer install --ignore-platform-reqs

echo ""
echo "==> Fatto. Prossimi passi:"
echo "    vendor/bin/sail up -d"
echo "    vendor/bin/sail artisan key:generate"
