# Campus Market — statut réel du projet

Projet : Campus Market (marketplace universitaire)
Période de référence : août 2026

## Vue d'ensemble

Ce dépôt est la source de vérité du projet. Il contient le frontend marketplace, les API serveur, le schéma Prisma, le flux d'authentification et les intégrations de paiement.

## Statut actuel

### Vérifié dans le dépôt
- Authentification email/password et Google
- Flux d'onboarding utilisateur
- Création de boutique vendeur et validation de rôle
- Catalogue produits avec recherche et filtres
- Espace acheteur : panier, checkout, commandes, favoris, notifications, support
- Espace vendeur : tableau de bord, produits, boutique, abonnements
- Intégration FedaPay pour checkout et abonnements
- Webhooks de paiement et gestion des statuts
- Prisma + Supabase configuré pour le projet actif

### Hors MVP / non finalisé
- Payouts et gains détaillés
- Système d'avis complet
- Personnalisation boutique avancée
- Panel admin séparé non intégré comme source de vérité dans ce dépôt

## Stack
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + PostgreSQL/Supabase
- Supabase Auth
- FedaPay
- Cloudinary

## Démarrage rapide

```bash
npm install
npm run dev
```

## Vérification locale

```bash
npx tsc --noEmit
npm run lint
```

## Documents utiles
- DOCUMENTATION_TECHNIQUE.md : architecture et statut technique réel
- checklist_passation_campus_market.md : checklist consolidée de passation

> Les anciens plans de passation sont archivés comme mémoire historique et ne doivent pas servir de référence de statut actif.
