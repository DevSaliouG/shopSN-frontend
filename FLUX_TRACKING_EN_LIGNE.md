# 🔄 Flux de Tracking des Utilisateurs En Ligne

## Schéma Simplifié

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVIGATEUR UTILISATEUR                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1. Ouverture app
                            ↓
┌─────────────────────────────────────────────────────────────┐
│        AnalyticsTrackingService.init()                       │
│        ✅ Démarre heartbeat automatique                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Toutes les 30 secondes
                            ↓
                   POST /api/analytics/heartbeat
                   { session_id: "abc123" }
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Laravel/PHP)                     │
│                                                               │
│  UPDATE analytics_sessions                                   │
│  SET last_activity = NOW()                                   │
│  WHERE session_id = 'abc123';                                │
│                                                               │
│  ✅ Timestamp mis à jour: 2024-01-15 14:32:45               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Dashboard admin demande stats
                            ↓
                   GET /api/admin/analytics/online-visitors
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    REQUÊTE SQL                               │
│                                                               │
│  SELECT COUNT(*) as online_users                             │
│  FROM analytics_sessions                                     │
│  WHERE last_activity >= NOW() - INTERVAL 5 MINUTE;          │
│                                                               │
│  Résultat: 47 utilisateurs                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Retour JSON
                            ↓
                   { "data": { "total": 47 } }
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              DASHBOARD ADMIN AFFICHE                         │
│                                                               │
│              👥 47 Utilisateurs en ligne                     │
│              🟢 Temps réel                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Timeline : Cycle de Vie d'une Session

```
T+0s    │ 🌐 Jean ouvre l'application
        │ → Heartbeat #1 envoyé
        │ → DB: last_activity = 14:30:00
        │ → Compteur: 1 utilisateur en ligne
        │
T+30s   │ ♻️ Heartbeat automatique #2
        │ → DB: last_activity = 14:30:30
        │ → Compteur: 1 utilisateur en ligne
        │
T+45s   │ 🌐 Marie ouvre l'application
        │ → Heartbeat #1 envoyé
        │ → DB: last_activity = 14:30:45
        │ → Compteur: 2 utilisateurs en ligne
        │
T+60s   │ ♻️ Jean heartbeat #3
        │ → DB: last_activity = 14:31:00
        │ → Compteur: 2 utilisateurs en ligne
        │
T+75s   │ ♻️ Marie heartbeat #2
        │ → DB: last_activity = 14:31:15
        │ → Compteur: 2 utilisateurs en ligne
        │
T+90s   │ ❌ Jean ferme l'onglet
        │ → Plus de heartbeat pour Jean
        │ → DB: last_activity reste = 14:31:00
        │ → Compteur: 2 utilisateurs (Jean encore comptabilisé)
        │
T+105s  │ ♻️ Marie heartbeat #3
        │ → DB: last_activity = 14:31:45
        │ → Compteur: 2 utilisateurs
        │
T+390s  │ ⏰ 5 minutes écoulées depuis dernier heartbeat Jean
(6m30)  │ → Requête SQL: last_activity >= NOW() - 5 minutes
        │ → Jean (14:31:00) est HORS du range
        │ → Marie (14:36:15) est DANS le range
        │ → Compteur: 1 utilisateur en ligne ✅
```

---

## Base de Données : État à T+105s

### Table `analytics_sessions`

| session_id  | user_id | last_activity     | seconds_ago | Statut      |
|-------------|---------|-------------------|-------------|-------------|
| abc123      | 42      | 14:31:00          | 255s (4m)   | 🟢 En ligne |
| def456      | 15      | 14:31:45          | 210s (3m)   | 🟢 En ligne |
| ghi789      | NULL    | 14:25:00          | 615s (10m)  | 🔴 Hors ligne |
| jkl012      | 8       | 14:32:30          | 135s (2m)   | 🟢 En ligne |

**Requête de comptage :**
```sql
WHERE last_activity >= '14:27:45'  -- NOW() - 5 minutes
```

**Résultat :** 3 utilisateurs en ligne (abc123, def456, jkl012)

---

## Comparaison des Approches

### 🟢 Approche Actuelle : Heartbeat (Implémentée)

**Principe :**
- Frontend ping toutes les 30s
- Backend compte sessions avec `last_activity` < 5 min

**Avantages :**
- ✅ Simple à implémenter
- ✅ Fonctionne partout (pas de firewall issues)
- ✅ Léger (1 tiny POST toutes les 30s)
- ✅ Suffisant pour 99% des cas

**Inconvénients :**
- ⚠️ Délai: jusqu'à 90 secondes
- ⚠️ Approximatif (lecture passive = "actif")

**Coût :**
- 2 requêtes/minute par utilisateur
- 100 utilisateurs = 200 req/min = 12,000 req/heure
- Négligeable pour n'importe quel serveur moderne

---

### 🔵 Alternative : WebSocket (Non implémentée)

**Principe :**
- Connexion WebSocket persistante
- Serveur sait instantanément si déconnexion

**Avantages :**
- ✅ Temps réel absolu (< 1 seconde)
- ✅ Précis (disconnect = immédiat)
- ✅ Peut envoyer notifications push

**Inconvénients :**
- ❌ Complexe (Laravel Echo, Pusher/Soketi, Redis)
- ❌ Coûteux en ressources serveur
- ❌ Problèmes avec certains firewalls
- ❌ Gestion de reconnexion nécessaire

**Coût :**
- Connexion persistante par utilisateur
- 100 utilisateurs = 100 connexions ouvertes
- Nécessite infrastructure dédiée (Redis + WebSocket server)

---

## Code Backend Minimal (Laravel)

### 1. Migration

```php
Schema::create('analytics_sessions', function (Blueprint $table) {
    $table->id();
    $table->string('session_id', 100)->unique();
    $table->string('visitor_id', 100)->index();
    $table->unsignedBigInteger('user_id')->nullable()->index();
    
    // 🔥 CHAMP CLÉ
    $table->timestamp('last_activity')->index();
    
    $table->timestamp('session_started_at');
    $table->string('device_type', 50)->nullable();
    $table->string('ip_address', 45)->nullable();
});
```

### 2. Controller

```php
namespace App\Http\Controllers\Api;

class AnalyticsController extends Controller
{
    // Endpoint appelé toutes les 30s par CHAQUE utilisateur
    public function heartbeat(Request $request)
    {
        $sessionId = $request->header('X-Session-Id') 
                  ?? $request->session()->getId();
        
        DB::table('analytics_sessions')
            ->updateOrInsert(
                ['session_id' => $sessionId],
                ['last_activity' => now()]
            );
        
        return response()->json(['ok' => true]);
    }
}

class AdminAnalyticsController extends Controller
{
    // Endpoint pour dashboard admin
    public function getOnlineVisitors()
    {
        $threshold = now()->subMinutes(5);
        
        $stats = DB::table('analytics_sessions')
            ->where('last_activity', '>=', $threshold)
            ->selectRaw('
                COUNT(*) as total,
                COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as authenticated,
                COUNT(CASE WHEN user_id IS NULL THEN 1 END) as anonymous
            ')
            ->first();
        
        return response()->json(['data' => $stats]);
    }
}
```

### 3. Routes

```php
// routes/api.php

// Public (pas d'auth required)
Route::post('/analytics/heartbeat', [AnalyticsController::class, 'heartbeat']);

// Admin only
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/analytics/online-visitors', 
        [AdminAnalyticsController::class, 'getOnlineVisitors']
    );
});
```

---

## Test de Validation

### Étape 1 : Ouvrir DevTools

**Network Tab → Filter "heartbeat"**

Vous devriez voir :
```
POST https://api.yoursite.com/api/analytics/heartbeat
Status: 200 OK
Payload: {}
Response: {"ok":true}

[30 secondes plus tard]

POST https://api.yoursite.com/api/analytics/heartbeat
Status: 200 OK
...
```

### Étape 2 : Vérifier la Base de Données

```sql
SELECT 
    session_id,
    user_id,
    last_activity,
    TIMESTAMPDIFF(SECOND, last_activity, NOW()) as seconds_ago
FROM analytics_sessions
WHERE last_activity >= NOW() - INTERVAL 5 MINUTE
ORDER BY last_activity DESC;
```

**Résultat attendu :**
```
session_id                            | user_id | last_activity        | seconds_ago
--------------------------------------|---------|----------------------|------------
a1b2c3d4-e5f6-7890-abcd-ef1234567890 | 42      | 2024-01-15 14:32:45  | 12
b2c3d4e5-f6g7-8901-bcde-fg2345678901 | NULL    | 2024-01-15 14:32:18  | 39
```

### Étape 3 : Tester avec Plusieurs Fenêtres

1. **Fenêtre 1** : Normal
2. **Fenêtre 2** : Incognito
3. **Fenêtre 3** : Autre navigateur

**Attendre 30 secondes → Recharger dashboard**

**Résultat attendu :** 3 utilisateurs en ligne

---

## Optimisations Production

### 1. Index Composite
```sql
CREATE INDEX idx_online_check 
ON analytics_sessions(last_activity, user_id);
```

### 2. Partition par Date (si gros volume)
```sql
ALTER TABLE analytics_sessions
PARTITION BY RANGE (TO_DAYS(last_activity)) (
    PARTITION p_old VALUES LESS THAN (TO_DAYS('2024-01-01')),
    PARTITION p_current VALUES LESS THAN MAXVALUE
);
```

### 3. Cache Redis (30 secondes)
```php
Cache::remember('online_users', 30, function() {
    return DB::table('analytics_sessions')
        ->where('last_activity', '>=', now()->subMinutes(5))
        ->count();
});
```

**Gain : 30x moins de requêtes DB !**

---

## FAQ Rapide

### Q: Pourquoi 30 secondes de heartbeat et 5 minutes de seuil ?

**A:** 
- **30s** = Équilibre entre précision et charge serveur
  - Plus court (10s) = trop de requêtes
  - Plus long (60s) = moins précis
  
- **5 minutes** = Marge de sécurité
  - Si 2-3 heartbeats ratés = pas grave
  - Si l'utilisateur lit longtemps = toujours "en ligne"
  - Balance entre précision et user experience

### Q: Que se passe-t-il si l'utilisateur met son ordi en veille ?

**A:** Le heartbeat s'arrête → après 5 min considéré hors ligne → se reconnecte automatiquement au réveil.

### Q: Combien ça coûte en bande passante ?

**A:**
- 1 heartbeat = ~200 bytes
- 100 utilisateurs × 2 heartbeats/min × 200 bytes = **40 KB/min**
- **2.4 MB/heure**
- Totalement négligeable !

### Q: Peut-on détecter les "idle" users (inactifs) ?

**A:** Oui, avec JavaScript :
```typescript
let idleTime = 0;

// Réinitialiser à 0 sur interaction
document.addEventListener('mousemove', () => idleTime = 0);
document.addEventListener('keypress', () => idleTime = 0);

// Incrémenter chaque minute
setInterval(() => {
  idleTime++;
  if (idleTime > 5) {
    // Utilisateur idle > 5 minutes
    // Arrêter heartbeat ou envoyer status "idle"
  }
}, 60000);
```

---

## ✅ Checklist Finale

### Backend à faire
- [ ] Créer migration `analytics_sessions`
- [ ] Créer index sur `last_activity`
- [ ] Route POST `/api/analytics/heartbeat`
- [ ] Route GET `/api/admin/analytics/online-visitors`
- [ ] Tester avec 3 fenêtres ouvertes

### Frontend (déjà OK ✅)
- [x] Service AnalyticsTrackingService avec heartbeat
- [x] Dashboard avec auto-refresh
- [x] Affichage utilisateurs en ligne

---

**🎉 Une fois le backend implémenté, tout fonctionnera automatiquement !**
