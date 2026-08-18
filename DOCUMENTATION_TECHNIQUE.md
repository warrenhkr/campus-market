# Documentation technique — Campus Market

> Document de référence pour le dépôt actif. Ce fichier reflète le statut réel du code présent dans le projet.

## 1. Objet

Le dépôt contient la marketplace étudiante Campus Market ainsi que les routes API, le schéma Prisma et les intégrations paiement/authentification nécessaires à son fonctionnement.

## 2. Stack technique
- Next.js 16
- React 19
- TypeScript
- Prisma 5.x
- PostgreSQL via Supabase
- Supabase Auth
- Tailwind CSS
- shadcn/ui
- FedaPay
- Cloudinary

## 3. Architecture

### Frontend
- App Router de Next.js
- Routes publiques : accueil, catalogue, détail produit, connexion, inscription, onboarding
- Espace acheteur : compte, commandes, panier, checkout, favoris, notifications, support
- Espace vendeur : tableau de bord, produits, boutique, abonnement

### Backend
- Route API serveur pour auth, seller, checkout, favorites, notifications, produits, shop, webhook
- Validation des données côté serveur
- Rôle utilisateur, vérification vendeur, onboarding et autorisations

### Données
- Prisma comme couche ORM
- PostgreSQL/Supabase comme base
- RLS activé sur les zones sensibles

## 4. Fonctionnalités réellement implémentées

### Authentification
- Inscription email/mot de passe
- Connexion email/mot de passe
- Authentification Google
- Onboarding utilisateur avec sauvegarde université/faculté/filière
- Redirection protégée via proxy et middleware de route

### Marketplace
- Catalogue produits avec recherche/filtres
- Détail produit
- Panier local
- Checkout FedaPay
- Confirmation de commande et pages de succès/annulation

### Espace acheteur
- Dashboard compte
- Historique des commandes
- Favoris
- Notifications
- Support/tickets

### Espace vendeur
- Dashboard vendeur
- Gestion des produits
- Gestion de la boutique
- Abonnements vendeur
- Vérification de rôles et statuts d'entreprise

### Paiements
- Création de transaction FedaPay
- Webhook de paiement
- Mise à jour des statuts commande et paiement
- Gestion des abonnements vendeur

## 5. Points de vigilance à retenir

- Le dépôt est la source de vérité ; les anciens fichiers de passation ne doivent pas être considérés comme statut courant.
- Le panel admin séparé est un projet distinct et ne doit pas être fusionné automatiquement dans ce dépôt sans validation du schéma Prisma.
- Les éléments avancés de payouts/earnings et de revue d'avis restent des améliorations après MVP.

## 6. Ce qui reste hors MVP

- Dashboard de gains détaillé pour les vendeurs
- Retraits / payouts avancés
- Système de notation produit/vendeur complet
- Personnalisation boutique ultra avancée
- Modération admin séparée dans un autre dépôt ou service

## 7. Validation locale utile

```bash
npm install
npm run dev
npx tsc --noEmit
npm run lint
```

## 8. Fichiers de référence utiles
- README.md : résumé court et statut actuel
- checklist_passation_campus_market.md : checklist de passation consolidée

> Ce document est le référentiel technique actuel. Les anciens plans de passation historiques sont des archives, pas des documents actifs.
