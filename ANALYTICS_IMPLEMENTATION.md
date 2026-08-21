# Implémentation Analytics E-commerce WhatsApp

## Architecture

### Événements trackés

#### 1. `page_view` ✅ Déjà implémenté
- Déclenché sur chaque navigation
- Données: url, path, title, page_type, product_id

#### 2. `product_view` ✅ Déjà implémenté
- Déclenché sur consultation d'un produit
- Données: product_id, product_name, product_price, product_category

#### 3. `whatsapp_purchase_click` ⚠️ À implémenter
- **CRITIQUE**: Déclenché UNIQUEMENT sur clic "Acheter via WhatsApp"
- Données: product_id, product_name, product_price, quantity, user_id (si connecté)
- **Ce n'est PAS une commande confirmée, c'est une INTENTION d'achat**

### KPI du dashboard

#### KPI Principaux
1. **Visiteurs aujourd'hui** - Visiteurs uniques (count distinct visitor_id par jour)
2. **Visites aujourd'hui** - Sessions totales
3. **Vues produits** - Count product_view events
4. **Clics WhatsApp** - Count whatsapp_purchase_click events
5. **Utilisateurs intéressés** - Count distinct users avec ≥1 clic WhatsApp
6. **Taux d'intention d'achat** - (clics WhatsApp / visiteurs uniques) × 100

#### KPI Secondaires
- Pages vues totales
- Pages par session (moyenne)
- Durée moyenne de session
- Taux de rebond
- Visiteurs en ligne (dernière 5 min)

#### Statistiques par période
- Graphique quotidien: visiteurs, visites, vues produits, clics WhatsApp
- Comparaison vs période précédente

#### Produits performants
1. **Plus consultés**: Ranking par product_view count
2. **Plus de clics WhatsApp**: Ranking par whatsapp_purchase_click count
3. **Meilleur taux d'intérêt**: (clics WhatsApp / vues) × 100

#### Funnel comportemental
```
Visiteurs (sessions)
    ↓ (% consultation produit)
Vues produits
    ↓ (% clic WhatsApp)
Clics WhatsApp (intentions d'achat)
```

#### Répartition visiteurs
- Nouveaux vs récurrents
- Mobile vs Desktop vs Tablet
- Sources de trafic (direct, search, social, referral)

### Backend Endpoints Requis

```
GET /api/admin/analytics/kpi?period=today
GET /api/admin/analytics/chart-stats?period=7days
GET /api/admin/analytics/products/top-viewed?period=30days&limit=10
GET /api/admin/analytics/products/top-whatsapp?period=30days&limit=10
GET /api/admin/analytics/funnel?period=today
GET /api/admin/analytics/recent-activity?limit=20
GET /api/admin/analytics/online-visitors

POST /api/analytics/track/page-view
POST /api/analytics/track/event
POST /api/analytics/track/whatsapp-click  ⚠️ NOUVEAU
```

### Tables Base de Données (À créer si nécessaire)

#### `analytics_sessions`
```sql
- id
- visitor_id (UUID anonyme ou user_id)
- user_id (nullable - si connecté)
- session_started_at
- session_ended_at
- device_type (mobile/desktop/tablet)
- browser
- os
- referrer_type (direct/search/social/referral)
- referrer_url
- is_new_visitor (boolean)
- page_views_count
- duration_seconds
```

#### `analytics_events`
```sql
- id
- session_id
- user_id (nullable)
- event_type (page_view/product_view/whatsapp_purchase_click/etc)
- event_category
- event_label
- product_id (nullable)
- event_data (JSON)
- event_value (nullable)
- created_at
```

#### `analytics_page_views`
```sql
- id
- session_id
- url
- path
- title
- page_type
- product_id (nullable)
- created_at
- duration_seconds
```

### Formules de calcul

#### Visiteurs uniques
```sql
SELECT COUNT(DISTINCT visitor_id) 
FROM analytics_sessions 
WHERE session_started_at >= '2024-01-01'
```

#### Sessions totales
```sql
SELECT COUNT(*) 
FROM analytics_sessions 
WHERE session_started_at >= '2024-01-01'
```

#### Vues produits
```sql
SELECT COUNT(*) 
FROM analytics_events 
WHERE event_type = 'product_view' 
  AND created_at >= '2024-01-01'
```

#### Clics WhatsApp
```sql
SELECT COUNT(*) 
FROM analytics_events 
WHERE event_type = 'whatsapp_purchase_click' 
  AND created_at >= '2024-01-01'
```

#### Utilisateurs intéressés
```sql
SELECT COUNT(DISTINCT session_id) 
FROM analytics_events 
WHERE event_type = 'whatsapp_purchase_click' 
  AND created_at >= '2024-01-01'
```

#### Taux d'intention d'achat
```sql
(clics_whatsapp / visiteurs_uniques) * 100
```

#### Taux de rebond
```sql
SELECT (COUNT(*) FILTER (WHERE page_views_count = 1) * 100.0 / COUNT(*))
FROM analytics_sessions
WHERE session_started_at >= '2024-01-01'
```

## Vocabulaire correct

❌ **NE PAS UTILISER:**
- "Ventes"
- "Commandes confirmées"
- "Chiffre d'affaires"
- "Revenus"
- "Taux de conversion" (sauf si explicitement défini comme intention)

✅ **UTILISER:**
- "Clics WhatsApp"
- "Intentions d'achat"
- "Demandes d'achat WhatsApp"
- "Utilisateurs intéressés"
- "Taux d'intention d'achat"
- "Produits générant le plus d'intérêt"
