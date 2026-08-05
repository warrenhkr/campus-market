# PASSATION DE PROJET — CAMPUS MARKET
## Session complète — Juin 2026

---

## Présentation

Campus Market est une marketplace universitaire béninoise (étudiants UCAO-EGEI et autres établissements) permettant d'acheter, vendre et échanger produits et services sur le campus. Le projet est composé de deux applications Next.js distinctes partageant la même base Supabase PostgreSQL.

---

## Architecture

```
C:\Users\BYLL HOUNKANRIN\
├── admin-recovery/              ← Panel administration
└── apps/campus-market/          ← Marketplace frontend
```

Les deux apps partagent le même projet Supabase `qhizilkpriniyztsptvi` (région `eu-central-1`) et le même schéma Prisma (synchronisé manuellement entre les deux dossiers).

---

## Technologies

| Couche | Stack |
|---|---|
| Frontend | Next.js 16.2.6, TypeScript, Tailwind CSS v4, Shadcn/UI (Nova/Radix), Framer Motion |
| Backend admin | Next.js 16.2.5, mêmes technologies |
| ORM | Prisma 5.22.0 (pas Prisma 7 — incompatibilité testée et écartée) |
| Base de données | Supabase PostgreSQL 17 |
| Auth | Supabase Auth |
| Paiement | FedaPay (sandbox) |
| Emails | Resend |
| Toasts | Sonner |
| Icônes | Lucide React |

---

## État d'avancement détaillé

### ✅ Frontend — Pages terminées

**Public**
- `/` — Accueil (hero, catégories, produits récents, stats animées, glow effects)
- `/login` — Connexion
- `/register` — Inscription avec choix Étudiant/Vendeur, universités publiques (liste déroulante avec facultés) ou privées (champ libre), indicateur de force mot de passe
- `/products` — Catalogue avec filtres recherche/catégorie
- `/products/[id]` — Détail produit complet (image, prix, avis, vendeur, produits similaires, bouton favoris fonctionnel)
- `/become-seller` — Formulaire demande boutique

**Espace acheteur (`/account`)**
- `/account` — Dashboard avec salutation personnalisée (prénom), quick links, commandes récentes
- `/account/orders` — Liste commandes
- `/account/orders/[id]` — Détail commande avec stepper de statut animé
- `/account/cart` — Panier (géré en `localStorage`)
- `/account/checkout` — Formulaire paiement + intégration FedaPay
- `/account/profile` — Modification nom + mot de passe
- `/account/favorites` — Liste favoris (table `favorites` + API complète)
- `/account/notifications` — Centre de notifications avec filtres lu/non-lu
- `/account/support` — Système de tickets avec fil de discussion en temps réel

**Espace vendeur (`/seller`)**
- `/seller` (layout + dashboard) — Stats, commandes récentes, vérification rôle SELLER
- `/seller/products` — Liste produits avec statuts colorés
- `/seller/products/new` — Création produit avec upload image Supabase Storage
- `/seller/orders` — Commandes reçues filtrées par vendeur
- `/seller/shop` — Personnalisation boutique (nom, description, image, slug)

**Paiement**
- `/success` — Confirmation paiement
- `/cancel` — Annulation paiement

### ❌ Frontend — Pages restantes

- `/seller/products/[id]/edit` — Modifier un produit existant
- `/seller/subscription` — Abonnement vendeur + renouvellement FedaPay
- `/shop/[slug]` — Page publique boutique (mentionnée comme requise mais pas encore codée dans cette session)
- `/seller/reviews` — Avis reçus par le vendeur (V1.1, non bloquant)

### Composants créés (réutilisables)

`AnimatedSection`, `AnimatedCard`, `AnimatedCounter`, `PageTransition`, `TypewriterText`, `ThemeProvider`, `ThemeToggle` (switch dark/light avec animation liquide), `ImageUpload` (Supabase Storage), `AddToCartButton`, `FavoriteButton`, `NotificationBell` (frontend, distinct de celui du panel admin)

### Routes API créées

- `POST /api/become-seller`
- `POST /api/seller/products`
- `PATCH /api/seller/shop`
- `POST /api/checkout` (création commande + appel FedaPay)
- `GET/POST/DELETE /api/favorites`

### Routes API manquantes

- `PATCH /api/seller/products/[id]` (pour la page edit)
- Webhook FedaPay (`/api/webhook/fedapay`) référencé dans le code mais jamais implémenté concrètement

---

### ✅ Panel Admin — État

- Dashboard, Users, Vendors, Shops, Products, Orders, Payments, Subscriptions, Analytics, Reports, Reviews, Support, Notifications, Logs, Settings — toutes les pages existent fonctionnellement
- Bug critique corrigé : `rejectVendor` écrivait `APPROVED` au lieu de `REJECTED`, protection ajoutée contre l'écrasement du rôle `ADMIN` lors d'auto-approbation
- Fonction `is_admin()` SQL corrigée
- Style dark premium violet `#8B5CF6` appliqué sur Dashboard + page Users/UsersTable (refaits cette session)

### ❌ Panel Admin — Restant

Style dark premium violet à généraliser sur : Vendors, Shops, Products, Orders, Payments, Reports, Reviews, Support, Notifications (actuellement encore en style light/cassé avec problèmes d'encodage)

---

## Base de données — État précis

### Tables existantes
`admin_logs`, `categories`, `comments` (nouvelle, usage à clarifier avec Byll), `favorites`, `notifications`, `order_items`, `orders`, `payments`, `products`, `reports`, `reviews`, `sellers`, `settings`, `shops`, `support_ticket_replies`, `support_tickets`, `system_alerts`, `users`

### Modifications appliquées cette période

**Table `users`** — colonnes ajoutées :
```
phone               varchar
university          varchar
filiere             varchar
account_type        varchar, défaut 'student'
etablissement_type  varchar, défaut 'public'
```

**Table `favorites`** (nouvelle) :
```
id          uuid, PK
user_id     uuid, FK → users
product_id  uuid, FK → products
created_at  timestamp
```

**Table `notifications`** — colonne ajoutée :
```
user_id  uuid, nullable (null = notification globale/système)
```

### Sécurité RLS

`public.users` — RLS **réactivé** (était désactivé dans une session antérieure, c'était un risque de sécurité actif). Policies en place :
- `Users can read own profile` (SELECT, propriétaire)
- `Users can update own profile` (UPDATE, propriétaire)
- `Admins can update any user` (UPDATE, admin)
- `Admins can read all users` (SELECT, admin) — **ajoutée cette session**, débloque le panel admin Users qui ne voyait que l'admin lui-même
- Policy service role pour INSERT (trigger d'inscription)

**Point de vigilance non résolu** : pas de policy DELETE explicite vérifiée sur `users` — la suppression côté admin doit être confirmée comme passant bien par une voie sécurisée (Prisma direct ou service role), pas par le client browser.

### Tables encore manquantes selon l'audit fonctionnel

- `review_replies` ou colonne `seller_reply` sur `reviews` (réponse vendeur aux avis)
- `review_reports` (signalement avis abusif)
- `invoices` (factures/reçus)
- `payouts` (reversement vendeur — **décision business non tranchée**, reportée volontairement)

---

## Décisions produit validées

1. **Inscription** : deux boutons visuels Étudiant/Vendeur sur la même page `/register`
2. **Vendeur à l'inscription** : créé avec rôle `USER` + boutique en statut `PENDING`. Le rôle passe à `SELLER` uniquement après approbation admin — pas de compte vendeur actif immédiatement
3. **Université** : sélection publique/privée — publique affiche liste déroulante université puis liste déroulante faculté/école (UAC, UP, UNSTIM, UNA, UADC avec facultés détaillées) ; privée affiche un champ texte libre
4. **Notifications** : extension de la table existante avec `user_id` nullable plutôt que création de tables séparées (`notification_preferences`, `notification_reads` jugées superflues pour le volume actuel)
5. **Payout vendeur** : décision reportée, pas encore tranchée entre paiement direct FedaPay ou reversement plateforme — **bloque le développement de `/seller/payouts` et `/seller/earnings` détaillé**

---

## Audit technique réalisé (2 itérations)

Un audit CTO complet a été produit avec :
- Réévaluation de la complexité de `/shop/[slug]` (de 0,5j à 2j — module de confiance majeur, pas une simple liste)
- Reclassement du système d'avis de V2 vers MVP/V1.1 (facteur de confiance critique pour acheteurs ne connaissant pas le vendeur)
- Reclassement des notifications de secondaire vers quasi-obligatoire avant lancement
- Vérification complète de 20+ pages potentiellement manquantes (client, vendeur, marketplace)
- Audit base de données détaillé table par table
- Nouvelle estimation d'avancement par axe : **Backend 80%, DB 75%, API 70%, Admin 90%, Marketplace Client 65%→85% (après cette session), Marketplace Vendeur 60%, Paiement 75%, Tests 15%, Sécurité 40%→60% (après réactivation RLS)**

**Avancement global réévalué : environ 70-75%** après le travail de cette session (favoris, notifications, support ajoutés depuis le dernier audit à 64%).

---

## Problèmes connus / points de vigilance

- Turbopack provoque des panics aléatoires sur Windows — relancer `npm run dev` si ça arrive
- Erreurs `ECONNRESET` / `AuthRetryableFetchError` rencontrées plusieurs fois — liées à l'instabilité de connexion internet locale (Cotonou), pas à des bugs de code. Solution : relancer le serveur, parfois changer le DNS
- `package-lock.json` à la racine `C:\Users\BYLL HOUNKANRIN\` cause un warning Turbopack sur le workspace root — sans danger, peut être ignoré ou nettoyé
- Le frontend n'a jamais été testé en flow complet (inscription → achat → paiement FedaPay → confirmation) — **prochaine étape prioritaire**
- L'approbation vendeurs côté admin a été corrigée mais pas re-testée avec un vrai compte vendeur après le fix
- Aucun travail Git formel mentionné dans l'historique — **un push GitHub de sauvegarde est en attente**
- Table `comments` ajoutée à la base sans qu'on en ait discuté l'usage — à clarifier

---

## Identifiants utiles

| Élément | Valeur |
|---|---|
| Projet Supabase | `qhizilkpriniyztsptvi` |
| Région | `eu-central-1` (pooler `aws-1`, pas `aws-0`) |
| Admin email | `adminwarrencampusmarket@gmail.com` |
| Mot de passe DB | `CampusMkt2026SecureDB9x` |
| Repo GitHub admin | `warrenhkr/campus-market-admin` |

---

## Plan d'exécution — ordre exact restant

### Sprint immédiat (cette suite de session)
1. `/seller/products/[id]/edit`
2. `/seller/subscription`
3. `/shop/[slug]` (complet, pas juste une liste — voir audit complexité réévaluée)
4. Test du flow complet bout-en-bout
5. Push GitHub

### Sprint pré-production
6. Uniformisation dark premium violet sur toutes les pages admin restantes
7. Réponse vendeur aux avis + signalement + modération
8. Décision business payout vendeur, puis développement associé
9. Vérification policy DELETE sur `users`

### Sprint production
10. `/seller/analytics`, `/seller/earnings` détaillé
11. Tests automatisés (priorité : flux paiement et auth)
12. Job cron expiration abonnement vendeur
13. SEO, `/categories/[slug]`, `/help-center`, `/faq`

---

## Consignes pour l'assistant qui reprend

Le projet a deux apps Next.js séparées partageant la même base Supabase. Style frontend : dark premium vert lime `#A3E635`. Style admin : dark premium violet `#8B5CF6`. Fond commun `#0A0A0A`, surfaces `#111111`/`#1A1A1A`.

Règles strictes : Prisma 5.22.0 uniquement, enums snake_case côté PostgreSQL, `proxy.ts` (pas `middleware.ts`) pour Next.js 16, Server Actions renvoient `{ success, error }` sans `redirect()` direct depuis un Client Component, `router.push() + setTimeout(refresh, 100)` après login, toasts via `sonner`, animations via Framer Motion, panier en `localStorage` (pas de table DB pour l'instant).

Avant tout nouveau développement vendeur lié à l'argent (`payouts`, `earnings`), vérifier d'abord si la décision business a été tranchée — elle ne l'était pas à la fin de cette session.