# 📊 Tracking des Utilisateurs En Ligne - Comment ça marche ?

## 🎯 Votre Question
> "Comment le système sait qu'il y a tant d'utilisateurs sur la plateforme à un instant T ?"

## ✅ Réponse Courte
Le frontend envoie automatiquement un **"heartbeat"** (signal de vie) toutes les **30 secondes** au backend. Le backend compte les sessions ayant reçu un heartbeat dans les **5 dernières minutes** = utilisateurs en ligne.

---

## 🔄 Fonctionnement Complet

### 1. **Frontend : Heartbeat Automatique**

Le service `AnalyticsTrackingService` envoie automatiquement un ping :

```typescript
// src/app/core/services/analytics-tracking.service.ts (lignes 25-30)

init() {
  // Heartbeat toutes les 30 secondes (garder session active)
  interval(30000)
    .pipe(switchMap(() => this.http.post(`${this.apiUrl}/heartbeat`, {})))
    .subscribe({
      error: () => {} // Ignorer erreurs heartbeat
    });
}
```

**Ce qui se passe :**
- ✅ L'utilisateur ouvre l'application → le service démarre
- ✅ Toutes les 30 secondes : `POST /api/analytics/heartbeat`
- ✅ Le backend reçoit le ping et met à jour `last_activity`
- ✅ L'utilisateur ferme l'onglet → les heartbeats s'arrêtent
- ⏱️ Après 5 minutes sans heartbeat → considéré "hors ligne"

---

### 2. **Backend : Tables Nécessaires**

#### Table `analytics_sessions`
```sql
CREATE TABLE analytics_sessions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,    -- UUID unique par session
  visitor_id VARCHAR(100) NOT NULL,            -- Cookie ou fingerprint
  user_id BIGINT UNSIGNED NULL,                -- NULL si anonyme
  
  -- 🔥 CHAMP CRITIQUE POUR TRACKING EN LIGNE
  last_activity TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  session_started_at TIMESTAMP NOT NULL,
  device_type VARCHAR(50),                     -- mobile/desktop/tablet
  browser VARCHAR(100),
  os VARCHAR(100),
  ip_address VARCHAR(45),
  country VARCHAR(2),
  
  INDEX idx_last_activity (last_activity),     -- Index pour requêtes rapides
  INDEX idx_user_id (user_id),
  INDEX idx_visitor_id (visitor_id)
);
```

**Champs importants :**
- `session_id` : Identifiant unique de la session (généré au premier chargement)
- `visitor_id` : Identifiant persistant du visiteur (cookie, localStorage)
- `user_id` : Si l'utilisateur est connecté
- **`last_activity`** : Timestamp mis à jour à chaque heartbeat (CLEF !)

---

### 3. **Backend : Endpoints à Implémenter**

#### A. Endpoint Heartbeat

**Route :** `POST /api/analytics/heartbeat`

**Ce qu'il doit faire :**
1. Récupérer `session_id` du cookie ou header
2. Mettre à jour `last_activity = NOW()`
3. Retourner statut 200

```php
// Laravel Example
public function heartbeat(Request $request)
{
    $sessionId = $request->session()->getId(); // ou header X-Session-Id
    
    DB::table('analytics_sessions')
        ->where('session_id', $sessionId)
        ->update(['last_activity' => now()]);
    
    return response()->json(['status' => 'ok']);
}
```

---

#### B. Endpoint Utilisateurs En Ligne

**Route :** `GET /api/admin/analytics/online-visitors`

**Logique :**
Compter les sessions avec `last_activity` dans les 5 dernières minutes.

```php
// Laravel Example
public function getOnlineVisitors()
{
    $fiveMinutesAgo = now()->subMinutes(5);
    
    $onlineUsers = DB::table('analytics_sessions')
        ->where('last_activity', '>=', $fiveMinutesAgo)
        ->count();
    
    $authenticatedUsers = DB::table('analytics_sessions')
        ->where('last_activity', '>=', $fiveMinutesAgo)
        ->whereNotNull('user_id')
        ->count();
    
    $anonymousUsers = $onlineUsers - $authenticatedUsers;
    
    return response()->json([
        'data' => [
            'total' => $onlineUsers,
            'authenticated' => $authenticatedUsers,
            'anonymous' => $anonymousUsers,
        ]
    ]);
}
```

---

#### C. Endpoint KPI Stats (avec online_users)

**Route :** `GET /api/admin/analytics/kpi?period=today`

```php
public function getKpiStats(Request $request)
{
    $period = $request->get('period', 'today');
    $fiveMinutesAgo = now()->subMinutes(5);
    
    // ... autres KPI
    
    $onlineUsers = DB::table('analytics_sessions')
        ->where('last_activity', '>=', $fiveMinutesAgo)
        ->count();
    
    return response()->json([
        'data' => [
            'unique_visitors' => 1234,
            'page_views' => 5678,
            // ... autres KPI
            'online_users' => $onlineUsers, // 🔥 UTILISATEURS EN LIGNE
        ]
    ]);
}
```

---

### 4. **Frontend : Affichage en Temps Réel**

Le composant `AnalyticsDashboardComponent` rafraîchit automatiquement :

```typescript
// analytics-dashboard.component.ts (ligne 99+)

startAutoRefresh() {
  this.refreshSubscription = interval(60000)  // Toutes les 60 secondes
    .pipe(switchMap(() => this.analyticsService.getOnlineVisitors()))
    .subscribe({
      next: (response) => {
        this.onlineVisitors.set(response.data);
      }
    });
}
```

**Résultat :**
- ✅ Le dashboard se met à jour toutes les 60 secondes
- ✅ Le nombre d'utilisateurs en ligne est quasi temps réel
- ✅ Délai maximum : 60s (refresh dashboard) + 30s (heartbeat) = **90 secondes max**

---

## 🎨 Interface Dashboard

### Template HTML (example)

```html
<!-- Carte Utilisateurs En Ligne -->
<div class="kpi-card online-users">
  <div class="kpi-icon">
    <svg><!-- icon utilisateurs --></svg>
  </div>
  <div class="kpi-content">
    <h3 class="kpi-value">{{ onlineVisitors()?.total || 0 }}</h3>
    <p class="kpi-label">Utilisateurs en ligne</p>
    <div class="kpi-details">
      <span class="badge badge-success">
        {{ onlineVisitors()?.authenticated || 0 }} connectés
      </span>
      <span class="badge badge-gray">
        {{ onlineVisitors()?.anonymous || 0 }} anonymes
      </span>
    </div>
  </div>
  <div class="kpi-status">
    <span class="pulse-dot"></span> Temps réel
  </div>
</div>
```

---

## 🔍 Comment Vérifier Que Ça Marche ?

### Test 1 : Vérifier les Heartbeats

**Ouvrir DevTools → Network → Filter "heartbeat"**

Vous devriez voir :
```
POST /api/analytics/heartbeat
Status: 200 OK
Interval: ~30 secondes
```

### Test 2 : Vérifier la Base de Données

```sql
-- Voir les sessions actives des 5 dernières minutes
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
session_id         | user_id | last_activity        | seconds_ago
-------------------|---------|----------------------|------------
abc123xyz          | 42      | 2024-01-15 14:32:45  | 12
def456uvw          | NULL    | 2024-01-15 14:32:30  | 27
ghi789rst          | 15      | 2024-01-15 14:31:50  | 67
```

### Test 3 : Simuler Plusieurs Utilisateurs

**Ouvrir plusieurs fenêtres :**
1. Fenêtre normale
2. Fenêtre privée (incognito)
3. Autre navigateur
4. Mobile

**Attendre 30 secondes → Recharger le dashboard**

Le compteur devrait afficher : **4 utilisateurs en ligne**

---

## 🎯 Avantages de Cette Approche

### ✅ Pros
- **Simple** : Pas besoin de WebSocket complexe
- **Léger** : 1 requête POST minimale toutes les 30s
- **Fiable** : Fonctionne même avec pare-feu strict
- **Précis** : Délai max 90 secondes
- **Scalable** : Index sur `last_activity` = requête rapide

### ⚠️ Limites
- **Délai** : Pas du vrai temps réel (90s max)
- **Approximatif** : Si l'utilisateur lit sans bouger, il reste "en ligne"
- **Trafic** : 2 requêtes/minute par utilisateur (négligeable)

### 🚀 Alternative : WebSocket (Temps Réel Pur)
Si vous avez besoin de **< 5 secondes de délai**, utilisez :
- Laravel Echo + Pusher/Soketi
- Socket.io
- Server-Sent Events (SSE)

**Mais pour 99% des cas, le heartbeat suffit !**

---

## 🧪 Requêtes SQL Utiles

### Compter utilisateurs en ligne
```sql
SELECT COUNT(*) as online_users
FROM analytics_sessions
WHERE last_activity >= NOW() - INTERVAL 5 MINUTE;
```

### Utilisateurs connectés vs anonymes
```sql
SELECT 
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as authenticated,
  COUNT(CASE WHEN user_id IS NULL THEN 1 END) as anonymous,
  COUNT(*) as total
FROM analytics_sessions
WHERE last_activity >= NOW() - INTERVAL 5 MINUTE;
```

### Distribution par device
```sql
SELECT 
  device_type,
  COUNT(*) as count
FROM analytics_sessions
WHERE last_activity >= NOW() - INTERVAL 5 MINUTE
GROUP BY device_type;
```

### Top 10 utilisateurs les plus actifs
```sql
SELECT 
  u.nom, u.prenom, u.email,
  s.last_activity,
  TIMESTAMPDIFF(SECOND, s.last_activity, NOW()) as seconds_ago
FROM analytics_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.last_activity >= NOW() - INTERVAL 5 MINUTE
  AND s.user_id IS NOT NULL
ORDER BY s.last_activity DESC
LIMIT 10;
```

---

## 📈 Optimisations

### 1. Index sur last_activity
```sql
CREATE INDEX idx_last_activity 
ON analytics_sessions(last_activity);
```

### 2. Nettoyage des sessions anciennes
```sql
-- Supprimer sessions > 24h
DELETE FROM analytics_sessions
WHERE last_activity < NOW() - INTERVAL 24 HOUR;
```

**Automatiser avec un cron (Laravel) :**
```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->call(function () {
        DB::table('analytics_sessions')
            ->where('last_activity', '<', now()->subDay())
            ->delete();
    })->daily();
}
```

### 3. Cache Redis (Optionnel)
Pour éviter de requêter la DB toutes les 60s :

```php
public function getOnlineVisitors()
{
    return Cache::remember('online_visitors', 30, function () {
        $fiveMinutesAgo = now()->subMinutes(5);
        
        return DB::table('analytics_sessions')
            ->where('last_activity', '>=', $fiveMinutesAgo)
            ->count();
    });
}
```

Cache pendant 30 secondes = **30x moins de requêtes DB !**

---

## ✅ Checklist d'Implémentation

### Backend
- [ ] Créer table `analytics_sessions` avec `last_activity`
- [ ] Créer index sur `last_activity`
- [ ] Implémenter `POST /api/analytics/heartbeat`
- [ ] Implémenter `GET /api/admin/analytics/online-visitors`
- [ ] Ajouter `online_users` dans `GET /api/admin/analytics/kpi`
- [ ] Tester avec plusieurs navigateurs ouverts
- [ ] Ajouter cron de nettoyage des sessions anciennes

### Frontend
- [ ] ✅ Service `AnalyticsTrackingService` déjà configuré
- [ ] ✅ Heartbeat automatique toutes les 30s déjà actif
- [ ] ✅ Dashboard rafraîchit automatiquement toutes les 60s
- [ ] ✅ Affichage dans l'interface déjà prêt

### Tests
- [ ] Ouvrir 3 fenêtres → vérifier compteur = 3
- [ ] Fermer 1 fenêtre → attendre 5 min → vérifier compteur = 2
- [ ] Vérifier heartbeat dans DevTools Network
- [ ] Vérifier `last_activity` dans la DB

---

## 🎓 Résumé pour les Non-Techniques

**Question :** Comment l'application sait combien de personnes sont connectées ?

**Réponse :**
1. Votre navigateur envoie un "Je suis là !" toutes les 30 secondes
2. Le serveur note : "OK, cet utilisateur était actif il y a 10 secondes"
3. Pour compter les utilisateurs en ligne, le serveur compte ceux qui ont dit "Je suis là !" dans les 5 dernières minutes
4. Le tableau de bord affiche ce nombre et se met à jour toutes les minutes

**Exemple concret :**
- 14h30:00 → Jean ouvre l'application → heartbeat envoyé
- 14h30:30 → heartbeat automatique
- 14h31:00 → heartbeat automatique
- 14h31:15 → Marie ouvre l'application → heartbeat envoyé
- 14h31:30 → Jean ferme l'onglet → plus de heartbeat
- 14h36:30 → Serveur vérifie : Jean dernier heartbeat = 14h31:00 (5 min) → HORS LIGNE
- 14h36:30 → Marie dernier heartbeat = 14h36:00 (30s) → EN LIGNE
- **Résultat affiché : 1 utilisateur en ligne (Marie)**

---

## 📞 Support

Si vous avez des questions :
1. Vérifier les heartbeats dans Network tab (DevTools)
2. Vérifier `last_activity` dans la DB
3. Vérifier que l'endpoint `/api/analytics/heartbeat` retourne 200 OK
4. Vérifier les logs Laravel pour erreurs

**Statut actuel :**
- ✅ Frontend : 100% prêt (heartbeat actif)
- ⏳ Backend : À implémenter (tables + endpoints)
- ⏳ Tests : À effectuer

---

**TL;DR : Le frontend ping toutes les 30s. Le backend compte qui a pingé dans les 5 dernières minutes. Simple et efficace !** 🎉
