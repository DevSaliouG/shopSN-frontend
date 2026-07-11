#!/bin/sh
set -e

# Le volume frontend_node_modules monte un répertoire vide par-dessus
# les node_modules installés dans l'image. On réinstalle si ng est absent.
if [ ! -f node_modules/.bin/ng ]; then
    echo "Installing npm dependencies..."
    npm ci --ignore-scripts
    echo "Dependencies installed."
fi

exec "$@"
