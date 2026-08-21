#!/bin/bash

# Script de vérification santé DkrOnlineStore
# Vérifie que tous les services fonctionnent correctement

echo "🏥 Health Check DkrOnlineStore"
echo "================================"
echo ""

# Configuration
FRONTEND_URL="https://dkronlinestore.sn"
API_URL="https://api.dkronlinestore.sn"
TIMEOUT=10
ERRORS=0

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de test
check_url() {
    local url=$1
    local name=$2
    local expected_code=${3:-200}

    echo -n "Checking $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url")

    if [ "$response" -eq "$expected_code" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $response, expected $expected_code)"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Fonction pour vérifier le contenu
check_content() {
    local url=$1
    local name=$2
    local keyword=$3

    echo -n "Checking $name content... "

    content=$(curl -s --max-time $TIMEOUT "$url")

    if echo "$content" | grep -q "$keyword"; then
        echo -e "${GREEN}✓ OK${NC} (found '$keyword')"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (keyword '$keyword' not found)"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# 1. Frontend
echo "📱 Frontend Checks"
echo "-------------------"
check_url "$FRONTEND_URL" "Homepage" 200
check_url "$FRONTEND_URL/produits" "Products page" 200
check_url "$FRONTEND_URL/a-propos" "About page" 200
check_url "$FRONTEND_URL/contact" "Contact page" 200
check_content "$FRONTEND_URL" "Homepage title" "DkrOnlineStore"
echo ""

# 2. SEO Files
echo "🔍 SEO Files"
echo "-------------"
check_url "$FRONTEND_URL/robots.txt" "robots.txt" 200
check_url "$FRONTEND_URL/sitemap.xml" "sitemap.xml" 200
check_content "$FRONTEND_URL/robots.txt" "robots.txt content" "User-agent"
check_content "$FRONTEND_URL/sitemap.xml" "sitemap.xml content" "urlset"
echo ""

# 3. SSL/HTTPS
echo "🔒 SSL/HTTPS"
echo "-------------"
echo -n "Checking SSL certificate... "
if curl -s --max-time $TIMEOUT "$FRONTEND_URL" | grep -q "HTTP/2"; then
    echo -e "${GREEN}✓ OK${NC} (HTTPS/2 enabled)"
else
    echo -e "${YELLOW}⚠ WARNING${NC} (HTTPS/2 not detected)"
fi

# Vérifier expiration SSL
ssl_expiry=$(echo | openssl s_client -servername dkronlinestore.sn -connect dkronlinestore.sn:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$ssl_expiry" ]; then
    echo -e "SSL expires: ${GREEN}$ssl_expiry${NC}"
else
    echo -e "${YELLOW}⚠ Could not check SSL expiry${NC}"
fi
echo ""

# 4. API
echo "🔌 API Checks"
echo "--------------"
check_url "$API_URL/api/health" "API Health" 200
check_url "$API_URL/api/products" "Products API" 200
echo ""

# 5. Performance (basique)
echo "⚡ Performance"
echo "---------------"
echo -n "Measuring page load time... "
load_time=$(curl -o /dev/null -s -w '%{time_total}' --max-time $TIMEOUT "$FRONTEND_URL")
if (( $(echo "$load_time < 3" | bc -l) )); then
    echo -e "${GREEN}✓ GOOD${NC} (${load_time}s)"
elif (( $(echo "$load_time < 5" | bc -l) )); then
    echo -e "${YELLOW}⚠ OK${NC} (${load_time}s)"
else
    echo -e "${RED}✗ SLOW${NC} (${load_time}s)"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 6. Service Worker
echo "👷 Service Worker"
echo "------------------"
check_url "$FRONTEND_URL/service-worker.js" "Service Worker" 200
echo ""

# 7. Assets critiques
echo "🖼️ Critical Assets"
echo "-------------------"
check_url "$FRONTEND_URL/assets/images/logo.webp" "Logo WebP" 200
check_url "$FRONTEND_URL/manifest.json" "PWA Manifest" 200
echo ""

# Résumé
echo "================================"
echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED${NC}"
    echo "🎉 Site is healthy!"
    exit 0
else
    echo -e "${RED}✗ $ERRORS CHECK(S) FAILED${NC}"
    echo "⚠️  Please investigate the issues above"
    exit 1
fi
