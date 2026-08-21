#!/bin/bash

# Script d'optimisation des images
# Convertit les images en WebP et génère des placeholders blur

echo "🖼️  Optimisation des images..."

# Vérifier si cwebp est installé
if ! command -v cwebp &> /dev/null; then
    echo "⚠️  cwebp n'est pas installé."
    echo "Installation: sudo apt-get install webp (Ubuntu/Debian)"
    echo "             brew install webp (macOS)"
    exit 1
fi

ASSETS_DIR="src/assets/images"
CONVERTED=0

# Fonction pour convertir une image en WebP
convert_to_webp() {
    local input="$1"
    local output="${input%.*}.webp"

    # Ne pas convertir si déjà en WebP
    if [[ "$input" == *.webp ]]; then
        return
    fi

    # Ne pas convertir si le WebP existe déjà
    if [[ -f "$output" ]]; then
        echo "⏭️  Déjà converti: $output"
        return
    fi

    echo "🔄 Conversion: $input → $output"

    # Conversion avec qualité 85%
    if cwebp -q 85 "$input" -o "$output" 2>/dev/null; then
        CONVERTED=$((CONVERTED + 1))

        # Afficher la taille avant/après
        BEFORE=$(stat -c%s "$input" 2>/dev/null || stat -f%z "$input")
        AFTER=$(stat -c%s "$output" 2>/dev/null || stat -f%z "$output")
        SAVED=$((BEFORE - AFTER))
        PERCENT=$((100 - (AFTER * 100 / BEFORE)))

        echo "✅ Économie: $SAVED bytes ($PERCENT%)"
    else
        echo "❌ Échec: $input"
    fi
}

# Trouver toutes les images JPG, JPEG, PNG
find "$ASSETS_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read -r image; do
    convert_to_webp "$image"
done

echo ""
echo "✨ Terminé! $CONVERTED images converties en WebP"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Remplacer les références .jpg/.png par .webp dans le code"
echo "   2. Ajouter des <picture> avec fallback pour compatibilité"
echo "   3. Supprimer les anciennes images après vérification"
