# 📋 PASSATION CAMPUS MARKET — Checklist Collaborateur (Frontend Marketplace)

> **Dernière mise à jour :** 7 août 2026
> **Destinataire :** Collaborateur prenant en charge `campus-market` (Frontend)
> **Auteur :** Byll Hounkanrin

---

## 1. Vue d'ensemble du projet

**Campus Market** est une marketplace permettant aux étudiants béninois de créer une boutique, vendre des produits/services, et découvrir les offres de leur université ou filière.

**Valeur clé :** Visibilité locale (par université/filière), mise en avant des produits populaires du campus, système de notation, et paiement intégré via Mobile Money (FedaPay).

### Stack technique
- **Framework :** Next.js 16 (App Router, Turbopack)
- **Base de données :** PostgreSQL via Supabase
- **ORM :** Prisma 5.22.0
- **Authentification :** Supabase Auth (Email/Password + Google OAuth)
- **Paiements :** FedaPay (Mobile Money)
- **UI :** Tailwind CSS, shadcn/ui, Framer Motion

### Fonctionnalités principales
- [ ] Authentification & Onboarding (rôle Acheteur / Vendeur)
- [ ] Catalogue produits (recherche, filtres)
- [ ] Panier (local storage) & Checkout (FedaPay)
- [ ] Espace Acheteur (`/account` : commandes, favoris, notifications, support)
- [ ] Espace Vendeur (`/seller` : tableau de bord, gestion produits, commandes reçues, boutique)
- [ ] Système d'abonnement vendeur (4 paliers)

---

## 2. État du déploiement en production

**URL de production :** [https://campus-market-phi.vercel.app](https://campus-market-phi.vercel.app)

### Ce qui est en place, fonctionnel et vérifié :
- [x] **Authentification Google** publiée et fonctionnelle en production
- [x] **Authentification Email/Mot de passe**
- [x] **Flux d'Onboarding** complet avec sauvegarde correcte de l'université, faculté et filière
- [x] **Redirect URLs Supabase** correctement configurées pour les callbacks d'authentification
- [x] **Webhook FedaPay** créé et activé, sécurisé avec `FEDAPAY_WEBHOOK_SECRET`
- [x] **Variables d'environnement Vercel** configurées, incluant la connexion à la base de données via le **pooler Supabase**

---

## 3. Système d'abonnement vendeur

Le système repose sur 4 paliers. **Action requise :** Vérifier que le code implémente bien les limites suivantes :

- [ ] **Découverte (Gratuit) :** Commission 5%, 3 produits max, visibilité standard, stats basiques
- [ ] **Starter (500 FCFA/mois) :** Commission 2%, 10 produits max, badge "Vendeur Vérifié", visibilité améliorée, stats basiques
- [ ] **Business (1000 FCFA/mois) :** Commission 0%, produits illimités, visibilité premium (homepage + recherche), stats avancées, outils promo (codes promo)
- [ ] **Pro (Sur-mesure) :** Commission 1-2%, gestionnaire de compte, API stocks, rapports détaillés

### Éléments techniques à vérifier :
- [ ] Page d'abonnement vendeur (`/seller/subscription`)
- [ ] Traitement du plan lors de la réception du webhook FedaPay (`subscription_plan` update)
- [ ] Cron job de vérification d'expiration des abonnements (`/api/cron/check-subscriptions`)

---

## 4. Ce qui reste à tester ou vérifier (Priorité Haute)

- [ ] **Flux de paiement de bout en bout :**
  1. Création d'un produit par un vendeur
  2. Ajout au panier par un acheteur
  3. Checkout via FedaPay
  4. Réception du Webhook FedaPay
  5. Mise à jour effective du statut de la commande en base de données
- [ ] **Flux d'inscription vendeur :** Demande de création de boutique (`/become-seller`) jusqu'à l'approbation par un admin
- [ ] **Downgrade à l'expiration d'un abonnement :**
  - Vérifier l'envoi de la notification au vendeur
  - Confirmer que les produits en excès **ne sont pas masqués automatiquement** (downgrade soft)

---

## 5. Fonctionnalités potentiellement incomplètes (À développer/finir)

- [ ] **Page des revenus vendeurs** (`/seller/earnings` / `/seller/payouts`)
- [ ] **Gestion des retraits** (Décision business à trancher : paiement direct FedaPay vs reversement par la plateforme)
- [ ] **Système d'avis** (Notation des produits/vendeurs)
- [ ] **Favoris** (Sauvegarde complète des produits favoris)
- [ ] **Centre de notifications complet** (Affichage, marquage comme lu)

---

## 6. Points d'attention & Pièges connus

- 🪟 **Contrainte Windows sur `prisma generate` :** L'exécution de `npm run build` peut échouer avec une erreur `EPERM` (verrouillage fichier DLL) si le serveur de développement (`npm run dev`) tourne en parallèle. **Solution : Couper le serveur dev avant de build.**
- 🐘 **Pooler Supabase Obligatoire :** Les variables `DATABASE_URL` et `DIRECT_URL` doivent pointer vers `aws-1-eu-central-1.pooler.supabase.com` (pas `aws-0`).
- 🔑 **Clés FedaPay :** Ne pas confondre `FEDAPAY_SECRET_KEY` (appels API sortants) et `FEDAPAY_WEBHOOK_SECRET` (vérification des signatures des requêtes entrantes de FedaPay).

---

## 7. Bugs récemment corrigés (Ne pas re-tester sauf doute)

- ✅ **Rendu des selects :** Les `<select>` natifs HTML ont été remplacés par les composants `Select` de **shadcn/ui** pour supporter correctement le mode sombre.
- ✅ **Redirections Next.js :** Bug `NEXT_REDIRECT` intercepté dans les blocs `catch` génériques (corrigé en relançant l'erreur pour laisser Next.js faire la redirection).
- ✅ **Onboarding `faculty` null :** Erreur d'upsert Prisma corrigée en remplaçant `null` par une chaîne vide `""` pour le champ `faculty` (lorsque "Autre" est sélectionné).
- ✅ **Base de données Prod :** Erreur de connexion corrigée suite à une variable d'environnement `DATABASE_URL` tronquée sur Vercel.
