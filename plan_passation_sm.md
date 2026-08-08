# 📋 Plan de passation pro — Campus Market

> Version opérationnelle pour la clôture du projet avant toute amélioration post-lancement
> Objectif : finaliser le projet proprement, répartir le travail entre deux personnes, garder une traçabilité claire, et éviter les conflits de code.

---

## 1. Objectif principal

Finaliser la passation du projet en concentrant les efforts sur :
- la validation fonctionnelle critique,
- la stabilité du paiement et des webhooks,
- la qualité du frontend,
- et la mise en place d’un workflow de travail propre avec branches séparées, PR et merge final.

---

## 2. Répartition du travail

### Personne 1 — Frontend / UX / QA
Responsable de :
- l’expérience utilisateur,
- la cohérence visuelle,
- l’utilisation correcte de shadcn/ui et des icônes,
- la vérification des pages importantes,
- et la qualité générale du rendu.

### Personne 2 — Backend / Intégration / Stabilité
Responsable de :
- la logique métier,
- le paiement et les webhooks,
- les API et la base de données,
- la stabilité technique,
- et la validation des flux critiques.

### Commun aux deux
Responsable de :
- la validation des flux de bout en bout,
- la documentation de passation,
- la coordination des branches et PR,
- et la finalisation avant merge.

---

## 3. Règles de travail

### Sécurité des clés API
- Les clés API et accès sensibles restent du côté du partenaire qui les possède déjà.
- Le code ne doit jamais contenir de secrets en clair.
- Utiliser un fichier d’environnement local non versionné.
- Documenter les variables nécessaires dans un fichier de référence interne.

### Workflow Git
- Chaque personne travaille sur sa propre branche.
- Pas de merge direct sur la branche principale sans PR.
- Chaque PR doit contenir :
  - un résumé clair,
  - les fichiers modifiés,
  - et les vérifications faites.

### Branches recommandées à créer si nécessaire
- develop/passation : branche de coordination et de validation finale. Elle sert de base de travail commune pour la passation et reçoit les PR validées avant le merge final.
- feature/frontend-passation-ui : branche dédiée à l’amélioration de l’interface, de l’UX, de la cohérence visuelle, des composants shadcn/ui, de la responsivité et des pages prioritaires.
- feature/backend-passation-flow : branche dédiée à la validation des flux critiques, du paiement, des webhooks, des abonnements, des APIs, de la base de données et de la stabilité technique.
- chore/passation-documentation : branche dédiée à la documentation de passation, à la checklist de clôture, aux notes de QA et à la préparation du livrable final.
- fix/passation-critical-bugs : branche dédiée aux correctifs urgents sur les bugs bloquants identifiés pendant la validation.

### Processus de merge
1. Chaque branche est développée séparément.
2. Chaque personne ouvre une PR vers la branche de travail commune.
3. Vérification commune des changements.
4. Merge final après validation complète.

---

## 4. Tâches à faire aujourd’hui

### A. Tâches communes à tous les deux

#### Validation fonctionnelle critique
- [x] Vérifier l’authentification Google
- [x] Vérifier l’authentification email / mot de passe
- [x] Vérifier le flux d’onboarding complet
- [x] Vérifier la création de boutique vendeur
- [x] Vérifier la création de produits
- [x] Vérifier le parcours acheteur jusqu’au paiement
- [x] Vérifier l’espace vendeur principal

#### Paiement et abonnement
- [x] Tester le flux complet checkout → payment → webhook → mise à jour commande
- [x] Vérifier la mise à jour du statut des commandes en base
- [x] Vérifier la mise à jour de subscription_plan
- [x] Vérifier l’expiration et le downgrade
- [x] Vérifier la notification liée à l’abonnement

#### Qualité globale
- [x] Identifier les bugs visibles majeurs
- [ ] Vérifier les erreurs d’affichage et les cas vides
- [ ] Tester les écrans sur mobile et desktop
- [ ] Consolider la liste des corrections à faire

### B. Tâches côté Frontend (Personne 1)

#### UI / UX / Design system
- [x] Revoir les pages principales pour une cohérence visuelle
- [x] Utiliser shadcn/ui de manière cohérente
- [ ] Utiliser la bibliothèque d’icônes installée de façon uniforme
- [ ] Remplacer les usages dispersés par des composants réutilisables
- [ ] Harmoniser boutons, inputs, cards, badges, modales et tableaux
- [ ] Vérifier la cohérence des couleurs, espacements et typographies
- [ ] Réduire les styles ad hoc et les duplications

#### Pages prioritaires à améliorer
- [ ] /login
- [ ] /register
- [ ] /become-seller
- [ ] /account
- [x] /seller/dashboard
- [x] /seller/subscription
- [x] /seller/products
- [ ] /account/favorites
- [ ] /account/notifications

#### Actions immédiates 4B
- [x] Vérifier le menu seller pour un état actif et hover visible
- [x] Restaurer le bouton `Ajouter un produit` au bon emplacement dans le dashboard
- [x] Ajuster les cartes rapides du dashboard avec shadcn/ui et Tailwind
- [x] Revenir sur le fichier seller pour améliorer les tâches et la cohérence du plan (très important : specification-parametres-boutiques-universitaire)
- [x] Conserver les pages déjà corrigées sans toucher à leur ergonomie validée
- [ ] Implémenter la spécification des paramètres des boutiques universitaires à partir du fichier `specification-parametres-boutiques-universitaires.md` : analyser le schéma Prisma existant, identifier les modèles `Store`/`Shop`/`User`/`University`/`Campus` déjà présents, définir les champs de base nécessaires, préparer la structure API/serveur, intégrer la persistance Prisma, prévoir l’upload Cloudinary pour logo/bannière/favicon, définir les sections de paramètres (général, apparence, livraison, paiements, commandes, notifications, réseaux sociaux, médias), ajouter la validation serveur, sécuriser les accès par propriétaire de boutique, et documenter le plan d’implémentation par phases pour une livraison progressive sans casser l’architecture existante.

#### Critères d’acceptation frontend
- [ ] Les pages sont propres et cohérentes
- [ ] Les composants shadcn/ui sont bien utilisés
- [ ] Les icônes sont cohérentes et non dispersées
- [ ] L’interface est responsive
- [ ] Les états de chargement et d’erreur sont visibles

### C. Tâches côté Backend / Intégration (Personne 2)

#### Paiement et webhooks
- [x] Vérifier la logique de création de transaction FedaPay
- [x] Vérifier la réception du webhook FedaPay
- [x] Vérifier la mise à jour des statuts de paiement et de commande
- [x] Vérifier les cas d’échec et d’annulation
- [x] Vérifier l’idempotence du traitement webhook

#### Abonnement vendeur
- [x] Vérifier l’activation du plan via le webhook
- [x] Vérifier l’expiration et le downgrade
- [x] Vérifier les limites selon le plan
- [x] Vérifier les notifications liées à l’abonnement

#### Logs, sécurité et stabilité
- [ ] Vérifier les erreurs API importantes
- [ ] Vérifier la gestion des erreurs côté serveur
- [ ] Vérifier les permissions et rôles
- [ ] Corriger les bugs bloquants détectés
- [ ] Valider le build et les erreurs de compilation

#### Critères d’acceptation backend
- [ ] Les flux critiques fonctionnent de bout en bout
- [ ] Les données sont bien mises à jour en base
- [ ] Les erreurs sont gérées proprement
- [ ] Le build ne bloque plus sur les éléments critiques

---

## 5. Tâches de finition à ne pas oublier

### Checklist de clôture
- [x] Authentification validée
- [x] Onboarding validé
- [x] Boutique vendeur validée
- [x] Produits publiés correctement
- [x] Panier et checkout validés
- [x] Paiement et webhook validés
- [x] Abonnement validé
- [x] Pages vendeur/acheteur vérifiées
- [x] Frontend refondu proprement
- [x] Documentation de passation complète

### Fonctionnalités à finaliser si temps reste
- [ ] Page gains / payouts
- [ ] Gestion des retraits
- [ ] Système d’avis
- [ ] Notifications complètes
- [ ] Favoris robustes

---

## 6. Priorités finales

### P0 — Bloquant
- paiement / webhook / abonnement / commandes
- authentification / onboarding / vendeur
- build stable et navigation correcte

### P1 — Important
- pages acheteur / vendeur principales
- cohérence frontend
- états vides et erreurs

### P2 — Nice to have
- avis, payouts, retrait, améliorations avancées

---

## 7. Plan de livraison aujourd’hui

### Phase 1 — matin
- [ ] Définir les branches à utiliser et les responsabilités
- [ ] Lister les bugs critiques à corriger
- [ ] Commencer les corrections prioritaires

### Phase 2 — après-midi
- [ ] Finaliser les changements frontend principaux
- [ ] Finaliser les corrections backend critiques
- [ ] Ouvrir les PR correspondantes

### Phase 3 — fin de journée
- [ ] Vérifier les PR ensemble
- [ ] Corriger les points restants
- [ ] Merger en fin de journée si tout est validé

---

## 8. Vérifications à suivre

### Vérifications fonctionnelles
- [x] Authentification fonctionnelle
- [ ] Onboarding fonctionnel
- [ ] Boutique vendeur créée correctement
- [ ] Produits publiés sans erreur
- [ ] Panier fonctionnel
- [ ] Checkout fonctionnel
- [ ] Webhook FedaPay réactif
- [ ] Commandes mises à jour correctement
- [ ] Abonnement activé / expiré correctement
- [ ] Notifications envoyées / lues
- [ ] Favoris sauvegardés correctement

### Vérifications UX / UI
- [ ] Toutes les pages ont un état vide cohérent
- [x] Les formulaires ont des messages d’erreur clairs
- [ ] Les boutons et actions sont cohérents
- [ ] Les pages sont responsive sur mobile/tablette/desktop
- [ ] Les couleurs, espacements et typographies sont uniformes
- [ ] Les icônes et composants sont utilisés de façon cohérente

### Vérifications technique
[x] Build fonctionnel sans erreur bloquante
- [ ] Prisma generate fonctionne correctement
- [ ] Les variables d’environnement sont bien documentées
- [ ] Les routes API sont sécurisées
- [ ] Le code est lisible et maintenable

---

## 9. Refonte frontend à prévoir avant le premier lancement

### Objectif
La refonte frontend doit être faite avant le premier lancement, pour garantir une interface propre, cohérente et maintenable.

### Ce qui doit être fait
- [ ] Revoir l’ensemble de l’UI avec un système de design cohérent
 - [ ] Utiliser shadcn/ui de manière cohérente et non dispersée
- [ ] Utiliser la bibliothèque d’icônes installée de façon uniforme (par ex. lucide-react)
- [ ] Remplacer les styles ad hoc par des composants réutilisables
- [ ] Standardiser les boutons, inputs, cards, modales, tableaux, badges, loaders et menus
- [ ] Harmoniser le thème clair/sombre
- [ ] Uniformiser les espacements, les typographies et les états hover/focus
- [ ] Réduire la duplication de code dans les vues
- [ ] Introduire une structure de composants claire : atoms, molecules, layout si besoin

### Règles de refonte à respecter
- [ ] Utiliser des composants shadcn/ui plutôt que des éléments HTML custom trop répétitifs
- [ ] Garder les composants visuels simples, accessibles et cohérents
- [ ] Ne pas mélanger plusieurs styles sans logique
- [ ] Préférer les composants réutilisables aux “one-off” styles
- [ ] Appliquer les bonnes pratiques de design system sur chaque nouvelle page

---

## 10. Points d’attention et pièges connus

- [ ] Windows : éviter de lancer le build pendant que le serveur dev tourne, sinon Prisma generate peut échouer avec une erreur EPERM
- [ ] Supabase : utiliser le pooler pour DATABASE_URL et DIRECT_URL
- [ ] FedaPay : ne pas confondre FEDAPAY_SECRET_KEY et FEDAPAY_WEBHOOK_SECRET
- [ ] Vérifier les environnements de dev / staging / production avant toute mise à jour
- [ ] Documenter toutes les variables sensibles dans un fichier de config ou README interne

---

## 11. Bugs corrigés à ne pas re-tester sauf doute

- [x] Rendu des selects corrigé avec shadcn/ui
- [x] Redirections Next.js corrigées
- [x] Onboarding faculty null corrigé
- [x] Problème de base de données prod corrigé

---

## 12. Définition finale (Definition of Done)

Le projet sera considéré comme prêt pour la passation lorsqu’il sera possible de confirmer :
- [ ] toutes les fonctionnalités critiques fonctionnent
- [ ] le paiement et les webhooks sont validés
- [ ] les abonnements vendeur sont cohérents
- [ ] les pages acheteur/vendeur sont stables
- [ ] le frontend a été refondu proprement avec shadcn/ui et icônes cohérentes
- [ ] la documentation de passation est complète et claire
