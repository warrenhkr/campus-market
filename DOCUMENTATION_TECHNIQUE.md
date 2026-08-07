# 📚 Documentation Technique Globale — Campus Market

> **Projet :** Campus Market (Marketplace étudiante)  
> **Version :** 1.0.0 (Août 2026)  
> **Auteur/Mainteneur :** Byll Hounkanrin & Équipe  

---

## 1. Architecture du Système

Campus Market est divisé en deux applications Next.js indépendantes partageant la même base de données pour séparer strictement les préoccupations de sécurité et de performances.

### 1.1 Composants principaux
- **Campus Market (Frontend)** : Application publique destinée aux étudiants (acheteurs) et aux vendeurs. Déployée sur Vercel.
- **Admin Recovery (Panel Admin)** : Interface privée destinée à l'équipe interne pour la modération, la gestion financière et le support. Déployée séparément.
- **Base de données Centrale** : Instance unique PostgreSQL hébergée sur **Supabase**.
- **Services tiers** : 
  - **FedaPay** : Passerelle de paiement Mobile Money locale.
  - **Resend** : Service d'envoi d'emails transactionnels (OTP admin, notifications d'approbation).

### 1.2 Stack Technique Globale
- **Framework React :** Next.js 16 (App Router) avec Turbopack
- **Typage :** TypeScript strict
- **ORM :** Prisma 5.22.0 (La version 7 est proscrite pour cause d'incompatibilité)
- **Authentification :** `@supabase/ssr` (Supabase Auth)
- **Styling :** Tailwind CSS v4 + variables CSS natives
- **Composants UI :** shadcn/ui (basé sur Radix UI) + Framer Motion
- **Notifications UI :** Sonner (`toast`)

---

## 2. Modèle de Données (Base de données)

La base de données est gérée via Prisma. Voici les entités principales :

### 2.1 Utilisateurs & Rôles
- **Users** : Gère l'identité. Contient `email`, `role` (`USER`, `SELLER`, `ADMIN`), et les métadonnées étudiantes (`university`, `faculty`, `filiere`).
- **Sellers** : Profil marchand étendu d'un utilisateur. Gère le statut de vérification, le plan d'abonnement, et la date d'expiration.
- **Shops** : La vitrine d'un vendeur. Un `Seller` peut avoir des `Shops` (boutiques).

### 2.2 E-commerce
- **Categories** : Catégorisation des produits.
- **Products** : Liés à une boutique et une catégorie. Gèrent le prix, l'image, le stock et le statut de modération (`APPROVED`, `PENDING_REVIEW`, `REJECTED`, `HIDDEN`).
- **Favorites** : Table de liaison entre Utilisateurs et Produits.

### 2.3 Commandes & Paiements
- **Orders** : Trace l'intention d'achat d'un utilisateur. Possède un statut (`PENDING`, `COMPLETED`, `CANCELLED`, etc.).
- **OrderItems** : Le contenu d'une commande (quantité, prix unitaire figé au moment de l'achat).
- **Payments** : Transaction financière liée à une commande, gère les frais de plateforme et interagit avec l'API FedaPay (`transaction_id`).

### 2.4 Interactions & Sécurité
- **Reviews** : Avis laissés par les utilisateurs sur les produits.
- **Reports** : Signalements pour modération.
- **SupportTickets / Replies** : Centre de support intégré.
- **Notifications** : Système interne de notification (système ou par utilisateur).
- **AdminLogs** : Piste d'audit traçant toutes les actions sensibles de l'équipe administrative.
- **AdminOtp / AdminOtpRateLimit** : Tables éphémères pour la gestion de l'authentification sans mot de passe du panel admin.

---

## 3. Authentification & Sécurité

### 3.1 Côté Publique (Campus Market)
L'application publique utilise **Supabase Auth**. 
- **Méthodes** : Email/Mot de passe et OAuth (Google).
- **Onboarding** : Si un utilisateur ne possède pas l'information `onboarding_complete` dans les métadonnées JWT de sa session, le middleware (`proxy.ts`) force la redirection vers `/onboarding`.
- **Sécurité RLS (Row Level Security)** : Activée sur PostgreSQL. Les utilisateurs ne peuvent modifier que leurs propres données (`update own profile`).

### 3.2 Côté Admin (Admin Recovery)
Le panel admin utilise un système de **One-Time Password (OTP) par email**.
1. L'admin entre son adresse email.
2. Un code à 6 chiffres est généré, haché et stocké dans `admin_otps` et envoyé via **Resend**.
3. La vérification accorde une session Supabase si l'email correspond à un admin de la DB.
4. **Rate limiting** : La table `admin_otp_rate_limits` empêche le spam de requêtes.
5. **RPC Supabase** : Toutes les Server Actions vérifient `is_admin()` côté base de données avant d'exécuter une tâche sensible.

---

## 4. Intégration FedaPay (Paiements & Abonnements)

FedaPay gère la facturation via Mobile Money et cartes bancaires.

### 4.1 Clés d'API
- `FEDAPAY_SECRET_KEY` : Utilisée pour initier les transactions depuis le backend.
- `FEDAPAY_WEBHOOK_SECRET` : Clé distincte (commençant par `wh_`) utilisée exclusivement pour valider la signature cryptographique (`HMAC SHA256`) des appels webhooks entrants.

### 4.2 Webhook Flow
1. FedaPay envoie un événement (`transaction.approved` ou `transaction.canceled`) sur `POST /api/webhook/fedapay`.
2. Le backend valide la signature `x-fedapay-signature`.
3. Le payload est décodé. Selon les métadonnées de la transaction (`type === 'subscription'` ou commande classique), la base de données est mise à jour.
4. **Idempotence** : Les transactions déjà marquées comme `CAPTURED` ou existantes dans `processed_webhooks` sont ignorées pour éviter la double facturation.

---

## 5. Plans d'Abonnement Vendeur

Le modèle économique de la marketplace repose sur 4 paliers :

1. **Découverte (Gratuit)** : 3 produits max, 5% de commission, visibilité standard.
2. **Starter (500 FCFA/mois)** : 10 produits max, 2% de commission, badge vérifié.
3. **Business (1000 FCFA/mois)** : Produits illimités, 0% de commission, visibilité premium.
4. **Pro (Sur-mesure)** : Gestion de compte, API, tarifs négociés. Attribué **uniquement manuellement** par les administrateurs via le panel (`assignProPlan`).

Un **Cron Job** (`/api/cron/check-subscriptions`) est prévu pour surveiller les expirations (`subscription_expires_at`) et dégrader automatiquement les vendeurs (downgrade) sans supprimer leurs données.

---

## 6. Déploiement & Opérations

### 6.1 Connexion Base de Données
Sur Vercel et en local, Prisma se connecte via le **Pooler Supabase** (IPv4 compatible, PgBouncer) :
- `DATABASE_URL` utilise le port **6543** avec le flag `?pgbouncer=true`.
- `DIRECT_URL` utilise le port **5432** (non-pooled, nécessaire pour `npx prisma db push` et les migrations).
- Le domaine du pooler est toujours `aws-1-eu-central-1.pooler.supabase.com` pour ce projet.

### 6.2 Problèmes connus & Dépannage
- **Windows Prisma Lock (`EPERM`)** : Lors d'un build (`npm run build`) sur Windows, si le serveur de développement (`npm run dev`) est en cours d'exécution, le fichier `query_engine.dll` sera verrouillé, provoquant l'échec du build. Couper le serveur dev avant de build.
- **Turbopack Panics** : Turbopack peut s'arrêter inopinément. Il suffit de relancer `npm run dev`.
- **NEXT_REDIRECT** : Lors de l'utilisation de `redirect()` de Next.js dans un bloc `try/catch`, l'erreur `NEXT_REDIRECT` doit être attrapée et relancée (throw), sous peine de casser le routing côté client.

---

## 7. Interfaces Utilisateur (UI/UX)

- **Style Marketplace** : Design moderne, sombre et dynamique, avec des accents verts vifs (`#A3E635` / lime). Utilisation massive du "glassmorphism", de bordures fines et d'animations (Framer Motion).
- **Style Admin** : Orienté productivité, dense en information, mode sombre par défaut avec des accents violets premium (`#8B5CF6`). Utilise des datatables avec pagination serveur.
- **Shadcn/UI** : Les composants ont été isolés des composants natifs HTML pour garantir la compatibilité totale avec le plugin "next-themes" (Light/Dark mode parfait).
