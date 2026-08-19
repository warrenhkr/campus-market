# Espace admin / back-office — notes de réconciliation

Ce fichier liste les fonctionnalités attendues pour l'espace administrateur
d'après `Campus-Market.pdf` (section "3. Espace administrateur (Back-office)",
page 10-11). Ce chantier est développé séparément (dans un dépôt/dossier
distinct) pour des raisons de sécurité — ce document sert de checklist de
réconciliation le jour où les deux parties sont assemblées.

## Statut au moment de la rédaction

- Aucun code admin n'est présent dans `campus-market/app` à ce stade (pas de
  dossier `app/admin`, pas de route `app/api/admin/*`).
- Le schéma Prisma actuel n'a pas de rôle "administrateur" dédié — à vérifier
  si la partie séparée en a ajouté un (ex. table `AdminUser`, ou champ de
  rôle sur `User`/`Seller`).
- Un modèle `AdminLog` existe déjà dans `prisma/schema.prisma` (utilisé par
  `app/api/cron/check-subscriptions/route.ts` pour tracer les actions
  automatiques) — à réutiliser/étendre plutôt que dupliquer si l'espace
  admin a besoin de journaliser les actions humaines.

## Fonctionnalités attendues (source : PDF, page 10-11)

### Gestion des comptes utilisateurs
- [ ] Lister/rechercher les utilisateurs (acheteurs et vendeurs)
- [ ] Suspendre/réactiver un compte

### Validation des boutiques étudiantes
- [ ] File d'attente des boutiques en attente de validation
      (`Seller.verification_status = PENDING` existe déjà côté schéma)
- [ ] Approuver/rejeter une boutique avec motif

### Surveillance des transactions
- [ ] Vue d'ensemble des commandes/paiements (`Order`, `Payment`, et le
      nouveau `PaymentSplit` par vendeur ajouté le 11/08)
- [ ] Détection d'anomalies (transactions échouées répétées, etc.)

### Modération des contenus et produits publiés
- [ ] File de modération des produits (`Product.status = PENDING_REVIEW`
      existe déjà côté schéma — actuellement les produits sont créés en
      `PENDING_REVIEW` dans `app/api/seller/products/route.ts`, mais rien
      dans le code actuel ne les fait passer à `APPROVED`/`REJECTED` — à
      vérifier si l'espace admin gère bien cette transition)
- [ ] Gestion des signalements (modèle `Report` déjà présent dans le schéma)

### Analytics
- [ ] Produits les plus vendus
- [ ] Universités les plus actives (nécessite d'agréger par
      `User.university` via `Product → Shop → Seller → User`)
- [ ] Tendances de consommation

## Points de couture technique à vérifier à la réconciliation

1. **Rôles/permissions** : comment l'espace admin identifie-t-il un
   administrateur ? Si un champ/table dédié a été ajouté côté admin, il
   faudra une migration Prisma sur ce dépôt pour le reconnaître ici aussi
   (ex. `User.role` ou table séparée).
2. **Transition de statut produit** : `PENDING_REVIEW → APPROVED/REJECTED`
   n'est déclenchée nulle part dans ce dépôt actuellement — confirmer que
   l'admin appelle une route qui existe déjà, ou en prévoir une
   (`PATCH /api/admin/products/[id]` par ex.) si l'admin doit rester dans
   ce même dépôt/API.
3. **`Seller.verification_status`** : même remarque — confirmer le point
   d'entrée utilisé pour faire passer `PENDING → APPROVED/REJECTED`.
4. **`Report`** : vérifier que le modèle actuel (motifs, statut) couvre
   bien ce dont l'admin a besoin pour la modération.

---

# Vérification de la personnalisation boutique (11/08)

## Diagnostic effectué

J'ai vérifié toute la chaîne de personnalisation boutique (couleurs, logo,
bannière, favicon, visibilité des sections) :

1. **Formulaire** (`components/seller/ShopSettingsForm.tsx`) : tous les
   champs sont bien dans le state `form` et soumis via `...form` au submit.
2. **Route API** (`app/api/seller/settings/route.ts`) : reçoit bien tous les
   champs, les écrit dans `prisma.shop.update`.
3. **Validateur** (`lib/validators/shop-settings.ts`) : accepte bien
   `secondary_color`, `accent_color`, `favicon_url`, etc.
4. **Lecture vitrine** (`app/(main)/shop/[slug]/page.tsx`) : `include` (pas
   `select`) sur `shop`, donc tous les champs remontent automatiquement.

**Chaîne applicative correcte de bout en bout.**

## Point d'incertitude réel — à vérifier par toi

En cherchant pourquoi la personnalisation pourrait sembler ne pas
fonctionner, j'ai découvert que **quasiment aucune colonne de
personnalisation de `shops`** (`primary_color`, `secondary_color`,
`accent_color`, `background_color`, `text_color`, `show_*`, `delivery_*`,
`meta_title`, `meta_description`, `favicon_url`, etc. — la liste quasi
complète) **n'a de migration SQL correspondante** dans
`prisma/migrations/`. La toute première migration versionnée dans ce dépôt
(`20260728112447_add_subscription_plan`) ajoute uniquement une colonne sur
`sellers` — ce qui indique que la table `shops` existait déjà avant le
début du suivi de migrations, très probablement créée via `prisma db push`
(qui synchronise le schéma sans jamais écrire de fichier de migration).

Cela ne veut **pas forcément dire que c'est cassé** — les colonnes existent
sans doute déjà réellement en base. Mais je n'ai aucun moyen de le vérifier
depuis mon environnement (pas d'accès réseau à Supabase). Deux façons
rapides de vérifier côté toi :

- Dans le dashboard Supabase → Table Editor → table `shops` → confirmer que
  les colonnes `secondary_color`, `accent_color`, `favicon_url` existent.
- Ou en local : `npx prisma db pull` puis vérifier que le schéma introspecté
  contient bien ces colonnes (si absentes, `prisma db push` les créera).

Si elles manquent réellement, **`prisma db push`** est la façon la plus
rapide de les ajouter sans écrire de migration SQL manuelle pour un cas
aussi large (des dizaines de colonnes) — mais db push ne doit jamais être
utilisé sur une base de prod avec des données si un risque de perte de
données existe sur une colonne modifiée (ici, ce sont des ajouts purs,
donc sans risque).

---

# Réception du projet admin (12/08) — diagnostic critique

Le projet admin (`campus-market-admin-main`) a été reçu et exploré. Très
solide et bien structuré (pagination, filtres, export CSV/JSON, validation
Zod centralisée, audit logging, `assertAdmin()` sur les actions sensibles —
exactement ce que `ADMIN_GUIDE.md` et `IMPLEMENTATION_SUMMARY.md` décrivent).
Fonctionnalités listées comme "complètement implémentées" : Dashboard,
Users, Sellers, Products (modération), Orders, Payments (transactions,
refunds), Support, Categories, Reviews, Alerts, Settings, Logs.

## ⚠️ Risque critique à traiter AVANT toute autre chose

Le schéma Prisma du projet admin (`prisma/schema.prisma`, pas de dossier
`migrations/`, installation documentée via `npx prisma db push`) est une
**version significativement plus ancienne** de la base de données que
celle du projet principal (`campus-market`) :

- `Shop` (admin) : aucune colonne de personnalisation — pas de
  `primary_color`, `logo_url`, `banner_url`, `favicon_url`, `show_*`,
  `delivery_*`, `meta_title`, etc. (14+ colonnes manquantes).
- `Product` (admin) : version très simplifiée — pas de `original_price`,
  `promo_label`, `cta_text`, `type`, `metadata`, `stock_mode`, `slug`,
  et aucune des tables ajoutées cette session (`ProductFaq`,
  `ProductPricingTier`, `ProductVariant`, `ProductDeliveryZone`).
- `Payment` (admin) : pas de relation vers `PaymentSplit` (ajouté cette
  session pour la commission par vendeur en panier multi-boutiques).
- `Review` (admin) : pas de `is_verified_purchase`, `seller_reply`.

**Le vrai danger : `npx prisma db push` depuis le projet admin, avec ce
schéma daté, peut supprimer en production des colonnes/tables réellement
utilisées par le projet principal**, si les deux projets pointent vers la
même base (`DATABASE_URL`/`DIRECT_URL` — noms identiques dans les deux
projets, donc probable, mais pas confirmé avec certitude car aucun `.env`
n'était présent dans l'archive reçue). `prisma db push` propose
généralement une confirmation avant de supprimer des données, mais reste
un vrai risque si lancé sans lire attentivement l'invite, ou en mode
non-interactif/CI.

## Recommandation avant d'utiliser le projet admin en prod

1. **Confirmer d'abord** si `DATABASE_URL` du projet admin pointe
   réellement vers la même base que le projet principal.
2. Si oui : **ne jamais lancer `prisma db push` depuis le dossier admin**
   tant que son schéma n'a pas été resynchronisé avec celui du principal
   (copier le schéma du principal, ou migrer l'admin vers le même système
   de migrations versionnées plutôt que `db push`).
3. Envisager de fusionner les deux schémas Prisma en un seul fichier
   partagé entre les deux projets (évite ce genre de dérive à l'avenir).

Je n'ai pris aucune action sur ce projet en attendant confirmation — je
continue de vous documenter mon audit du code admin (pages, actions
serveur) sans jamais exécuter de commande Prisma dessus.
