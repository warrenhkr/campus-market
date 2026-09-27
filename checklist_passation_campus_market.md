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

## 2. FedaPay : état et passage live

- [x] Le propriétaire confirme que le parcours de paiement sandbox a été testé avec succès.
- [x] Le checkout serveur choisit l'API sandbox/live selon le mode configuré et la clé secrète de l'environnement.
- [x] Le panneau `/admin/payments` persiste le mode dans `settings.fedapay_mode`; il ne stocke pas les clés.
- [x] Le live est bloqué tant que la clé API secrète live, le secret du webhook live ou l'URL publique HTTPS ne sont pas configurés.
- [x] Le checkout refuse une configuration manquante avant de créer la commande; la clé sandbox n'est pas utilisée pour les payouts live de l'admin séparé.
- [x] La signature webhook suit le format du SDK officiel FedaPay (`t=<timestamp>,s=<HMAC>`), avec une fenêtre de 5 minutes.
- [ ] Ajouter les secrets live au gestionnaire de secrets du déploiement, sans les committer : `FEDAPAY_LIVE_SECRET_KEY` et `FEDAPAY_LIVE_WEBHOOK_SECRET`.
- [ ] Vérifier `NEXT_PUBLIC_APP_URL` ou `APP_URL` en HTTPS dans l'environnement du site principal.
- [ ] Créer/activer dans le compte FedaPay live le webhook `https://<domaine-public>/api/webhook/fedapay`, avec les événements de transaction nécessaires; reprendre son secret webhook live dans le déploiement.
- [ ] Ouvrir `/admin/payments`, vérifier qu'aucun prérequis ne manque, puis activer le live.
- [ ] Effectuer une transaction live contrôlée et confirmer dans FedaPay et la base que l'événement approuvé met le paiement à `CAPTURED` et la commande à `COMPLETED`; vérifier aussi annulation/échec et les journaux webhook.
- [ ] Si les retraits sont activés dans l'admin séparé, définir `FEDAPAY_ENV=live` et la même `FEDAPAY_LIVE_SECRET_KEY` dans son environnement, puis tester un payout de faible montant.

L'intégration utilise l'API serveur; `FEDAPAY_LIVE_PUBLIC_KEY` n'est pas nécessaire dans le flux actuel. La validation du sandbox ne prouve pas le bon fonctionnement du compte, des secrets ou du webhook live.

## 3. Ce qui reste à traiter pour un vrai MVP avancé

- [ ] Payouts/earnings détaillés
- [ ] Gestion des retraits
- [ ] Système d'avis complet
- [ ] Personnalisation avancée des boutiques au-delà du MVP
- [ ] Admin back-office séparé si besoin d'une vraie modération centralisée

## 4. Points de vigilance

- [x] La base de données doit être contrôlée via le schéma Prisma du dépôt actif.
- [x] Les anciens documents de passation historiques doivent être utilisés comme mémoires, pas comme documents de statut courant.
- [x] Les dépendances et l'architecture du dépôt doivent rester cohérentes avec la configuration projet réelle.

## 5. Consentement de statut

Ce document est la version active de la passation. Les travaux déjà réalisés sont classés comme complétés et ne doivent pas réapparaître dans une checklist de tâches à faire.
