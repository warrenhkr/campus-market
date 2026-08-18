# Checklist de passation — Campus Market

> Document consolidé. Il reflète le vrai statut du dépôt et ne réécrit pas les tâches déjà terminées comme si elles étaient encore à faire.

## 1. Statut global

### Implémenté et validé
- [x] Authentification email/password
- [x] Authentification Google
- [x] Flux onboarding complet
- [x] Création de boutique vendeur et rôle vendeur
- [x] Catalogue produits avec recherche et filtres
- [x] Panier et checkout
- [x] Intégration paiement FedaPay
- [x] Webhooks FedaPay
- [x] Mise à jour des statuts de commande et de paiement
- [x] Espace acheteur fonctionnel
- [x] Espace vendeur fonctionnel
- [x] Gestion d'abonnements vendeur
- [x] Notifications et favoris
- [x] Support client interne

### Vérifié techniquement
- [x] Prisma + Supabase en place
- [x] Structure Next.js App Router valide
- [x] TypeScript et lint configurés et utilisés
- [x] Correctifs de compatibilité projet déjà appliqués

## 2. Ce qui reste à traiter pour un vrai MVP avancé

- [ ] Payouts/earnings détaillés
- [ ] Gestion des retraits
- [ ] Système d'avis complet
- [ ] Personnalisation avancée des boutiques au-delà du MVP
- [ ] Admin back-office séparé si besoin d'une vraie modération centralisée

## 3. Points de vigilance

- [x] La base de données doit être contrôlée via le schéma Prisma du dépôt actif.
- [x] Les anciens documents de passation historiques doivent être utilisés comme mémoires, pas comme documents de statut courant.
- [x] Les dépendances et l'architecture du dépôt doivent rester cohérentes avec la configuration projet réelle.

## 4. Consentement de statut

Ce document est la version active de la passation. Les travaux déjà réalisés sont classés comme complétés et ne doivent pas réapparaître dans une checklist de tâches à faire.
