# Spécification — Paramètres des boutiques universitaires

## 1. Objectif

Cette spécification définit l'architecture fonctionnelle et technique du système de **paramètres des boutiques** pour une plateforme de vente dédiée aux universités.

L'objectif est de permettre à chaque vendeur de personnaliser et administrer sa boutique depuis un espace privé, tout en garantissant que **toutes les données persistantes soient réellement enregistrées en base de données via Prisma** et que **tous les médias soient stockés sur Cloudinary**.

Le système doit être conçu pour une marketplace universitaire et non comme une copie générique de Shopify.

---

# 2. Contraintes techniques obligatoires

Le système doit respecter les règles suivantes :

- Utiliser **Prisma ORM** pour toutes les opérations de persistance en base.
- La base de données est PostgreSQL/Supabase si c'est la base déjà utilisée par le projet.
- Utiliser **Cloudinary** pour les images et autres médias.
- Ne jamais stocker directement les fichiers binaires dans PostgreSQL.
- Stocker en base les métadonnées Cloudinary nécessaires :
  - `publicId`
  - `secureUrl`
  - `resourceType`
  - éventuellement `format`, `width`, `height`, `bytes`.
- Ne jamais faire confiance aux données envoyées par le frontend.
- Valider les données côté serveur.
- Vérifier que l'utilisateur connecté possède réellement la boutique qu'il tente de modifier.
- Ne jamais exposer les secrets Cloudinary ou les credentials serveur au client.
- Les opérations de création, modification et suppression doivent être persistantes.
- Après modification, l'interface doit afficher les données réellement enregistrées en base et non seulement l'état local React.
- Éviter les duplications de données.
- Utiliser des transactions Prisma lorsque plusieurs écritures doivent rester cohérentes.
- Prévoir des états `loading`, `error`, `success` et `empty`.
- Les formulaires doivent être correctement validés.
- Les paramètres non applicables à une boutique universitaire ne doivent pas être ajoutés inutilement.

---

# 3. Contexte métier

La plateforme permet à des étudiants, associations, clubs, petits commerces ou autres vendeurs autorisés de vendre à l'intérieur d'un environnement universitaire.

Une boutique appartient à un vendeur.

Une boutique est rattachée à une université/communauté universitaire selon le modèle existant du projet.

Les paramètres doivent donc permettre de gérer notamment :

- identité de la boutique ;
- université associée ;
- informations du vendeur ;
- apparence ;
- horaires ;
- moyens de contact ;
- livraison/retrait sur campus ;
- paiements ;
- commandes ;
- notifications ;
- réseaux sociaux ;
- SEO lorsque pertinent ;
- médias ;
- statut de la boutique.

---

# 4. Structure recommandée de la page Settings

Créer une navigation de paramètres claire :

```text
Paramètres
│
├── Général
│   ├── Informations de la boutique
│   ├── Vendeur
│   └── Localisation universitaire
│
├── Apparence
│   ├── Identité visuelle
│   ├── Couleurs
│   └── Affichage
│
├── Livraison & retrait
│
├── Paiements
│
├── Commandes
│
├── Notifications
│
├── Réseaux sociaux
│
├── Médias
│
├── SEO
│
├── Équipe
│
└── Avancé
```

Pour un MVP, les sections suivantes sont prioritaires :

1. Général
2. Apparence
3. Livraison & retrait
4. Paiements
5. Commandes
6. Notifications
7. Réseaux sociaux
8. Médias

SEO, équipe et paramètres avancés peuvent être implémentés progressivement.

---

# 5. Section Général

## 5.1 Informations de la boutique

Champs :

- `name`
- `slug`
- `description`
- `shortDescription`
- `email`
- `phone`
- `whatsapp`
- `currency`
- `language`
- `timezone`
- `status`

### Statut

Prévoir :

```text
ACTIVE
PAUSED
MAINTENANCE
```

Une boutique inactive ne doit plus accepter de nouvelles commandes.

Le statut doit être contrôlé côté serveur.

---

# 6. Identité du vendeur

Selon le modèle User déjà présent dans le projet, ne pas dupliquer inutilement les informations personnelles.

Si l'information appartient au compte utilisateur, la conserver dans `User`.

La boutique peut toutefois contenir les informations commerciales nécessaires :

- nom affiché ;
- nom légal si nécessaire ;
- email professionnel ;
- téléphone professionnel ;
- numéro WhatsApp ;
- description du vendeur.

Ne pas créer une deuxième source de vérité pour le nom/email du compte si `User` possède déjà ces informations.

---

# 7. Université et localisation

Une boutique universitaire doit être liée à son environnement universitaire.

Selon le schéma existant, utiliser la relation vers l'université/campus existant plutôt que créer une table parallèle.

Informations pouvant être configurées :

- université ;
- campus ;
- bâtiment ;
- zone ;
- point de retrait ;
- indication de localisation.

Exemple :

```text
Université : UAC
Campus : Abomey-Calavi
Point de retrait : Zone ENEAM
Indication : Devant le bâtiment principal
```

Le vendeur ne doit pas pouvoir modifier arbitrairement l'université à laquelle il appartient si cette relation est contrôlée par l'administration.

---

# 8. Horaires

Créer une gestion des horaires de disponibilité de la boutique.

Pour chaque jour :

```text
Lundi
Mardi
Mercredi
Jeudi
Vendredi
Samedi
Dimanche
```

Champs possibles :

- `isOpen`
- `openTime`
- `closeTime`

Prévoir éventuellement plusieurs plages horaires par jour.

Exemple :

```text
Lundi
08:00 - 18:00

Samedi
09:00 - 14:00

Dimanche
Fermé
```

Les horaires doivent être enregistrés en base.

---

# 9. Apparence

La personnalisation doit être persistante.

## 9.1 Logo

Champs :

- `logoUrl`
- `logoPublicId`

Le fichier est uploadé sur Cloudinary.

La base conserve uniquement les métadonnées nécessaires.

## 9.2 Bannière

Champs :

- `bannerUrl`
- `bannerPublicId`

Stockage Cloudinary obligatoire.

## 9.3 Icône/Favicon

Champs :

- `faviconUrl`
- `faviconPublicId`

Cloudinary obligatoire si cette fonctionnalité est proposée.

---

# 10. Personnalisation visuelle

Prévoir une configuration de thème.

Champs :

```text
primaryColor
secondaryColor
accentColor
backgroundColor
textColor
buttonRadius
```

Les couleurs doivent être validées comme valeurs CSS/hexadécimales valides.

Exemple :

```text
primaryColor = #8A9A5B
```

Ne pas enregistrer les couleurs uniquement dans localStorage.

Elles doivent être persistées en base.

---

# 11. Options d'affichage

Prévoir des booléens :

```text
showBanner
showCategories
showFeaturedProducts
showNewProducts
showReviews
showContact
showSocialLinks
```

Ne pas créer des dizaines d'options avant qu'elles soient réellement utilisées dans le storefront.

Chaque option doit avoir un usage concret dans le frontend.

---

# 12. Livraison et retrait

Pour une marketplace universitaire, le système doit privilégier :

- retrait sur campus ;
- livraison sur campus ;
- éventuellement livraison hors campus si autorisée.

## 12.1 Méthodes

Prévoir :

```text
PICKUP
CAMPUS_DELIVERY
LOCAL_DELIVERY
```

Une boutique peut activer/désactiver chaque méthode.

---

# 13. Points de retrait

Créer une structure permettant de définir des points de retrait.

Champs :

- `name`
- `description`
- `location`
- `instructions`
- `isActive`

Exemple :

```text
Nom : Point ENEAM
Localisation : Devant le bâtiment ENEAM
Instructions : Appelez le vendeur à votre arrivée
Actif : Oui
```

Les points de retrait doivent appartenir à une boutique.

---

# 14. Frais de livraison

Prévoir une configuration simple :

- livraison gratuite ;
- tarif fixe ;
- tarif par zone ;
- seuil de gratuité.

Champs possibles :

```text
deliveryEnabled
deliveryFee
freeDeliveryThreshold
```

Si le projet gère des zones, créer une relation dédiée :

```text
Store
  └── DeliveryZone[]
```

Avec :

```text
name
description
fee
isActive
```

---

# 15. Paiements

La plateforme doit permettre au vendeur d'activer les moyens de paiement réellement supportés par le projet.

Exemples :

```text
CASH
MOBILE_MONEY
CARD
MANUAL
```

Ne pas implémenter une intégration externe uniquement dans l'interface.

Une méthode affichée comme "connectée" doit réellement être configurée.

Pour chaque méthode, stocker uniquement les informations nécessaires.

Les secrets/API keys doivent être stockés de manière sécurisée côté serveur et ne jamais être renvoyés au navigateur.

---

# 16. Paiement manuel / Mobile Money

Si le paiement manuel est utilisé, permettre de renseigner :

- numéro de paiement ;
- opérateur ;
- nom du bénéficiaire ;
- instructions de paiement.

Exemple :

```text
Opérateur : MTN Mobile Money
Numéro : ********
Nom : Boutique XYZ

Instructions :
Effectuez le paiement puis indiquez la référence de transaction.
```

Les données sensibles doivent être protégées.

---

# 17. Commandes

Paramètres :

- autoriser les commandes ;
- accepter les commandes pendant les horaires d'ouverture ;
- permettre l'annulation par le client ;
- délai d'annulation ;
- préfixe des numéros de commande.

Exemple :

```text
ORD-000001
ORD-000002
```

Ne pas dépendre uniquement du frontend pour générer les numéros de commande.

Le serveur doit garantir leur unicité.

---

# 18. Statuts des commandes

Utiliser les statuts déjà présents dans le projet si une table `Order` existe.

Sinon prévoir un enum ou modèle cohérent.

Exemple :

```text
PENDING
CONFIRMED
PREPARING
READY
SHIPPED
DELIVERED
CANCELLED
```

Pour le retrait :

```text
READY
```

peut signifier que la commande est prête à être récupérée.

---

# 19. Notifications

Permettre au vendeur de choisir les notifications qu'il reçoit.

Exemples :

```text
newOrderNotification
orderCancelledNotification
lowStockNotification
paymentNotification
```

Pour le client :

```text
orderConfirmation
orderStatusUpdate
orderReady
```

Ces préférences doivent être persistées.

---

# 20. Réseaux sociaux

Champs :

```text
instagram
facebook
tiktok
whatsapp
youtube
```

Ne conserver que les réseaux réellement utilisés.

Les URLs doivent être validées.

Le numéro WhatsApp doit pouvoir être utilisé pour générer un lien de contact depuis le storefront, selon le format prévu par l'application.

---

# 21. SEO

Même si le projet est principalement universitaire, prévoir une base simple.

Champs :

```text
metaTitle
metaDescription
ogImageUrl
ogImagePublicId
```

La longueur des champs doit être validée.

L'image Open Graph doit être stockée sur Cloudinary.

---

# 22. Médias et Cloudinary

## Règle absolue

Tous les médias de la boutique doivent être stockés sur Cloudinary.

Cela concerne notamment :

- logo ;
- bannière ;
- favicon ;
- images de produits ;
- images de catégories ;
- image Open Graph ;
- autres médias réellement nécessaires.

La base de données ne doit pas contenir le fichier.

Elle doit contenir les références Cloudinary.

---

# 23. Structure média recommandée

Créer un modèle centralisé si cela correspond à l'architecture du projet.

Exemple conceptuel :

```prisma
model StoreMedia {
  id           String   @id @default(cuid())
  storeId      String
  publicId     String
  secureUrl    String
  resourceType String
  format       String?
  width        Int?
  height       Int?
  bytes        Int?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  store Store @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@index([storeId])
}
```

Adapter le nom du modèle au schéma existant.

Ne pas créer `StoreMedia` si le projet possède déjà une architecture média générique capable de répondre correctement au besoin.

---

# 24. Upload Cloudinary

Créer une logique serveur dédiée.

Le flux recommandé :

```text
Frontend
   ↓
Validation du fichier
   ↓
Endpoint / Server Action
   ↓
Vérification utilisateur + boutique
   ↓
Upload Cloudinary
   ↓
Récupération publicId + secureUrl + metadata
   ↓
Prisma create/update
   ↓
Retour du média enregistré
```

Ne jamais faire :

```text
Frontend → Cloudinary avec secret serveur
```

Les credentials Cloudinary doivent rester côté serveur.

---

# 25. Suppression d'un média

Lorsqu'un média est remplacé ou supprimé :

1. Vérifier l'utilisateur.
2. Vérifier que le média appartient à sa boutique.
3. Supprimer le fichier sur Cloudinary.
4. Supprimer ou mettre à jour la référence Prisma.
5. Retourner le résultat au frontend.

Si Cloudinary échoue, ne pas supprimer aveuglément la référence en base.

Prévoir une stratégie cohérente de gestion des erreurs.

---

# 26. Prisma — principes

Avant de modifier le schéma Prisma :

1. Lire le schéma Prisma existant.
2. Identifier les modèles déjà disponibles.
3. Réutiliser les modèles existants.
4. Ajouter uniquement les champs/tables nécessaires.
5. Vérifier toutes les relations.
6. Vérifier les contraintes `unique`.
7. Ajouter les index utiles.
8. Générer la migration.
9. Vérifier la migration.
10. Générer le client Prisma.

Ne jamais remplacer arbitrairement le schéma existant.

---

# 27. Modèle StoreSettings

Si l'architecture actuelle le justifie, créer un modèle séparé pour les paramètres.

Exemple conceptuel :

```prisma
model StoreSettings {
  id                    String   @id @default(cuid())
  storeId               String   @unique

  currency              String   @default("XOF")
  language              String   @default("fr")
  timezone              String?

  primaryColor          String?
  secondaryColor        String?
  accentColor           String?
  backgroundColor       String?
  textColor             String?

  showBanner             Boolean  @default(true)
  showCategories         Boolean  @default(true)
  showFeaturedProducts   Boolean  @default(true)
  showNewProducts        Boolean  @default(true)
  showReviews            Boolean  @default(true)
  showSocialLinks        Boolean  @default(true)

  deliveryEnabled        Boolean  @default(false)
  deliveryFee            Decimal?
  freeDeliveryThreshold  Decimal?

  allowGuestCheckout     Boolean  @default(true)
  allowCancellation      Boolean  @default(true)

  metaTitle              String?
  metaDescription        String?

  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  store Store @relation(fields: [storeId], references: [id], onDelete: Cascade)
}
```

Ce modèle est un exemple de référence et doit être adapté au schéma réel.

Ne pas créer plusieurs colonnes pour des informations déjà présentes ailleurs.

---

# 28. Horaires — modèle conceptuel

```prisma
model StoreOpeningHour {
  id        String   @id @default(cuid())
  storeId   String
  dayOfWeek Int
  isOpen    Boolean  @default(true)
  openTime  String?
  closeTime String?

  store Store @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@unique([storeId, dayOfWeek])
  @@index([storeId])
}
```

Si plusieurs plages par jour sont nécessaires, adapter vers :

```text
Store
  └── OpeningHour[]
```

avec plusieurs enregistrements par jour.

---

# 29. Permissions

Chaque action doit vérifier :

```text
Utilisateur connecté ?
        ↓
Possède une boutique ?
        ↓
La boutique ciblée appartient-elle à cet utilisateur ?
        ↓
L'utilisateur a-t-il la permission nécessaire ?
        ↓
Validation des données
        ↓
Mutation Prisma
```

Ne jamais utiliser uniquement :

```text
storeId envoyé par le client
```

comme preuve de propriété.

---

# 30. API / Server Actions

---

# Suivi de développement

Voici l'état d'avancement des tâches d'implémentation liées aux paramètres de boutique :

- [x] Étendre le formulaire de paramètres (`ShopSettingsForm`) pour inclure TikTok, YouTube et image OG
- [x] Transmettre les nouveaux champs depuis la page `seller/settings/page.tsx` vers le formulaire et l'API
- [x] Valider les nouveaux champs côté serveur (`lib/validators/shop-settings.ts`)
- [x] Persister `og_image_url` et `og_image_public_id` via l'API `app/api/seller/settings/route.ts`
- [x] Afficher les liens sociaux (TikTok/YouTube) et utiliser `og_image` pour le metadata Open Graph dans la vitrine (`app/(main)/seller/shop/[slug]/page.tsx`)
- [x] Lancer une compilation/`build` pour vérifier la cohérence TypeScript/Prisma

Remarque : la gestion avancée du `og_image_public_id` (suppression/transformation Cloudinary) est optionnelle et peut être implémentée séparément si tu le souhaites.

Créer des fonctions serveur organisées par domaine.

Exemple conceptuel :

```text
store/
├── getStoreSettings
├── updateStoreSettings
├── updateStoreAppearance
├── updateStoreHours
├── updateDeliverySettings
├── updatePaymentSettings
├── updateNotificationSettings
├── updateSocialLinks
├── uploadStoreMedia
└── deleteStoreMedia
```

Adapter cette structure aux conventions déjà utilisées dans le projet.

---

# 31. Validation

Utiliser le système de validation déjà présent dans le projet.

Si aucune solution n'est utilisée, une solution comme Zod peut être envisagée.

Valider :

- chaînes ;
- URLs ;
- couleurs ;
- emails ;
- numéros ;
- montants ;
- enums ;
- booléens ;
- identifiants ;
- fichiers ;
- taille des fichiers ;
- types MIME.

Les validations frontend améliorent l'UX mais ne remplacent jamais les validations serveur.

---

# 32. Interface utilisateur

La page Settings doit être claire et responsive.

Chaque section peut utiliser :

```text
Titre
Description
Formulaire
Bouton Enregistrer
État de sauvegarde
```

Exemple :

```text
Informations de la boutique

Nom de la boutique
[________________]

Description
[____________________________]

Email
[________________]

                     [Enregistrer]
```

Après sauvegarde :

```text
✓ Modifications enregistrées
```

En cas d'erreur :

```text
Impossible d'enregistrer les modifications.
Veuillez réessayer.
```

---

# 33. Sauvegarde

Ne pas faire une requête à la base à chaque frappe.

Utiliser un bouton :

```text
Enregistrer les modifications
```

ou une sauvegarde explicite par section.

Afficher clairement :

- données non sauvegardées ;
- sauvegarde en cours ;
- sauvegarde réussie ;
- erreur.

---

# 34. Chargement initial

Lors de l'ouverture des paramètres :

```text
Server
   ↓
Prisma
   ↓
Store + Settings + Hours + Delivery + ...
   ↓
Frontend
```

Ne pas mettre des valeurs fictives qui remplacent les valeurs de la base.

Les valeurs par défaut doivent être utilisées uniquement lorsqu'aucune configuration n'existe encore.

---

# 35. Création automatique des paramètres

Lorsqu'une boutique est créée :

```text
Créer Store
    ↓
Créer StoreSettings
    ↓
Créer OpeningHours par défaut
    ↓
Créer les configurations nécessaires
```

Utiliser une transaction Prisma si plusieurs opérations doivent réussir ensemble.

---

# 36. Gestion des valeurs par défaut

Exemples :

```text
currency = XOF
language = fr
allowGuestCheckout = true
allowCancellation = true
showBanner = true
showCategories = true
showFeaturedProducts = true
```

Les valeurs par défaut doivent être définies côté serveur/Prisma et non uniquement dans le frontend.

---

# 37. Cache et revalidation

Si le projet utilise Next.js App Router :

Après une modification persistante :

- revalider les données nécessaires ;
- invalider/revalider les pages concernées ;
- éviter qu'une ancienne configuration reste affichée après sauvegarde.

Utiliser les mécanismes de revalidation adaptés à l'architecture existante.

---

# 38. Audit et traçabilité

Si le projet possède déjà un système d'audit, enregistrer les modifications importantes :

```text
Utilisateur
Action
Boutique
Date
Type de modification
```

Exemples :

```text
STORE_SETTINGS_UPDATED
STORE_STATUS_CHANGED
STORE_MEDIA_UPLOADED
STORE_MEDIA_DELETED
```

Ne pas ajouter un système d'audit complexe si aucune infrastructure n'existe encore, mais prévoir une architecture compatible avec son ajout futur.

---

# 39. Sécurité

Obligatoire :

- authentification ;
- autorisation ;
- validation serveur ;
- protection contre les modifications d'une autre boutique ;
- protection des secrets ;
- vérification des uploads ;
- limites de taille ;
- vérification MIME ;
- gestion des erreurs sans exposer les secrets ;
- pas de credentials dans le frontend ;
- pas de confiance dans `storeId` envoyé par le client.

Si Supabase RLS est déjà utilisé dans le projet, conserver une politique cohérente avec l'autorisation applicative.

Prisma ne doit pas être utilisé comme excuse pour supprimer une couche de sécurité existante.

---

# 40. Zone dangereuse

Mettre les actions sensibles séparément :

```text
Mettre la boutique en pause
Supprimer la boutique
```

La suppression doit :

1. demander confirmation ;
2. vérifier l'utilisateur ;
3. supprimer proprement les données liées selon les relations Prisma ;
4. gérer les médias Cloudinary associés ;
5. éviter les suppressions accidentelles.

Ne jamais effectuer une suppression irréversible sur un simple clic.

---

# 41. Ce qui doit être stocké où

## PostgreSQL / Prisma

Stocker :

- informations boutique ;
- statut ;
- description ;
- coordonnées ;
- université/campus ;
- horaires ;
- paramètres d'apparence ;
- préférences ;
- livraison ;
- retrait ;
- paiements/configurations non secrètes ;
- notifications ;
- réseaux sociaux ;
- SEO ;
- références Cloudinary ;
- relations entre entités.

## Cloudinary

Stocker :

- logo ;
- bannière ;
- favicon ;
- images produits ;
- images catégories ;
- Open Graph ;
- autres fichiers médias autorisés.

## Frontend uniquement

Ne conserver temporairement que :

- état du formulaire ;
- état de chargement ;
- aperçu avant sauvegarde ;
- erreurs d'interface.

Les données importantes ne doivent pas dépendre de localStorage pour être persistantes.

---

# 42. Ce qui n'est pas encore implémenté dans la page

Dans l’implémentation actuelle de la page de paramètres boutiques, les éléments suivants restent à faire :

- Liaison boutique ↔ université / campus / bâtiment / zone / point de retrait.
- Gestion des horaires d’ouverture par jour et plages horaires.
- Configuration des points de retrait persistants.
- Gestion des zones de livraison et des frais par zone.
- Méthodes de paiement configurables réelles (CASH, MOBILE_MONEY, CARD, MANUAL).
- Paramètres détaillés de paiement manuel / Mobile Money.
- Options de commandes : activation, contraintes horaires, annulation, préfixe de numéro de commande.
- Statuts de commande et règles serveur associées.
- Préférences de notifications vendeur/client.
- Modèle `StoreSettings` séparé ou structure de paramètres dédiée.
- Modèle `StoreOpeningHour` et logique d’horaires persistantes.
- Modèle média Cloudinary générique et suppression de médias côté serveur.
- SEO Open Graph complet (`ogImageUrl`, `ogImagePublicId`).
- Rendu effectif de toutes les options d’affichage sur la boutique publique (`show_reviews`, `show_categories`, `show_featured_products`, `show_new_products`).
- Validation approfondie des URLs, couleurs et méthodes de paiement côté serveur au-delà du schéma actuel.

> La partie universitaire/campus sera traitée ensuite, comme prévu.
---

# 42. Ne pas créer de fausses fonctionnalités

Copilot ne doit pas :

- créer un bouton qui ne fait rien ;
- afficher "Enregistré" sans avoir écrit en base ;
- simuler un upload Cloudinary ;
- mettre des URLs d'images fictives ;
- utiliser uniquement localStorage ;
- mettre des données statiques dans les composants ;
- considérer une opération réussie sans vérifier la réponse serveur ;
- créer des modèles Prisma inutilisés ;
- ajouter des champs sans les utiliser ;
- afficher une intégration de paiement comme connectée alors qu'elle ne l'est pas.

---

# 43. Ordre d'implémentation

Implémenter dans cet ordre :

## Phase 1 — Audit

Avant tout code :

- analyser le repository ;
- analyser `schema.prisma` ;
- identifier `User`, `Store`, `Product`, `Order`, `University`, `Campus` et les autres modèles existants ;
- identifier le système d'authentification ;
- identifier le système de permissions ;
- identifier la configuration Cloudinary ;
- identifier les conventions API/server actions ;
- identifier les composants UI existants.

## Phase 2 — Database

- compléter le schéma Prisma ;
- ajouter uniquement les modèles/champs nécessaires ;
- créer la migration ;
- vérifier les relations ;
- vérifier les contraintes.

## Phase 3 — Services serveur

Créer :

- récupération des paramètres ;
- mise à jour ;
- horaires ;
- livraison ;
- paiements ;
- notifications ;
- réseaux sociaux ;
- médias ;
- Cloudinary.

## Phase 4 — UI

Créer les pages/sections Settings.

## Phase 5 — Cloudinary

Implémenter :

- upload ;
- remplacement ;
- suppression ;
- persistance des métadonnées.

## Phase 6 — Sécurité

Tester :

- utilisateur non connecté ;
- utilisateur sans boutique ;
- utilisateur d'une autre boutique ;
- vendeur autorisé ;
- données invalides ;
- fichier invalide.

## Phase 7 — Tests

Tester chaque fonctionnalité de bout en bout.

---

# 44. Checklist finale obligatoire

Avant de considérer le travail terminé, vérifier :

### Général

- [ ] Le nom de la boutique est sauvegardé.
- [ ] La description est sauvegardée.
- [ ] Le statut est sauvegardé.
- [ ] Les coordonnées sont sauvegardées.
- [ ] La devise est sauvegardée.
- [ ] L'université/campus utilise la relation existante.

### Apparence

- [ ] Les couleurs sont persistantes.
- [ ] Le logo est sur Cloudinary.
- [ ] La bannière est sur Cloudinary.
- [ ] Les références Cloudinary sont en base.
- [ ] Le storefront utilise réellement les paramètres.

### Horaires

- [ ] Les horaires sont persistants.
- [ ] Les jours fermés fonctionnent.
- [ ] Les horaires sont correctement récupérés.

### Livraison

- [ ] Les méthodes sont persistantes.
- [ ] Les frais sont persistants.
- [ ] Les points de retrait sont persistants.

### Paiements

- [ ] Les méthodes activées sont persistantes.
- [ ] Les informations nécessaires sont validées.
- [ ] Aucun secret n'est exposé au frontend.

### Notifications

- [ ] Les préférences sont persistantes.

### Réseaux sociaux

- [ ] Les URLs sont persistantes.
- [ ] Les URLs sont validées.

### Cloudinary

- [ ] Upload fonctionnel.
- [ ] Remplacement fonctionnel.
- [ ] Suppression fonctionnelle.
- [ ] Pas de credentials exposés.
- [ ] Les fichiers supprimés ne restent pas inutilement référencés en base.

### Sécurité

- [ ] Authentification vérifiée.
- [ ] Ownership de la boutique vérifié.
- [ ] Validation serveur présente.
- [ ] Un vendeur ne peut pas modifier une autre boutique.

### UX

- [ ] Loading states.
- [ ] Error states.
- [ ] Success states.
- [ ] Responsive.
- [ ] Pas de données fictives.
- [ ] Pas de bouton sans fonctionnalité.

---

# 45. Instruction finale pour Copilot

Tu dois implémenter cette spécification **dans le projet existant**, et non créer une architecture parallèle.

Avant toute modification :

1. Analyse le code existant.
2. Analyse `schema.prisma`.
3. Analyse les modèles et relations existants.
4. Analyse l'authentification.
5. Analyse les permissions.
6. Analyse l'intégration Cloudinary.
7. Analyse les conventions du projet.

Ensuite seulement, implémente les fonctionnalités.

Tu dois privilégier la réutilisation des composants, services, modèles et utilitaires déjà présents.

Toute donnée affichée dans les paramètres doit provenir de la base de données ou d'un état temporaire clairement identifié.

Toute modification doit être réellement persistée avec Prisma.

Toute image doit être réellement envoyée à Cloudinary et sa référence doit être persistée en base.

Ne considère jamais une fonctionnalité comme terminée simplement parce que l'interface fonctionne.

Une fonctionnalité est terminée uniquement lorsque :

```text
UI
 ↓
Validation
 ↓
Server Action / API
 ↓
Authorization
 ↓
Prisma
 ↓
PostgreSQL
```

et, pour les médias :

```text
UI
 ↓
Validation
 ↓
Server
 ↓
Cloudinary
 ↓
Prisma
 ↓
PostgreSQL
```

fonctionnent réellement de bout en bout.

Après implémentation, vérifie les migrations Prisma, les types TypeScript, les erreurs de build et les principales fonctionnalités.

Ne supprime pas de fonctionnalités existantes et ne casse pas les relations existantes sans justification.

Si une partie de cette spécification entre en conflit avec l'architecture existante, adapte l'implémentation à l'architecture réelle du projet tout en conservant les objectifs fonctionnels.

**Le résultat final doit être une fonctionnalité réellement opérationnelle et persistante, pas une simple maquette frontend.**
