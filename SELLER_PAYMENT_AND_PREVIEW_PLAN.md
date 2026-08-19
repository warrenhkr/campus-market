# Plan de travail : affichage produit, prévisualisation et intégration d'un système de paiement

Ce document décrit ce qu'il faut vérifier et préparer avant d'implémenter / améliorer :
- l'affichage complet d'une fiche produit (public) et la prévisualisation dans l'interface vendeur
- la persistance et l'application de tous les paramètres de boutique (apparence, CTA, couleurs, description riche, sections visibles)
- l'intégration d'un système de paiement complet (checkout, paiements sécurisés, webhooks, notifications vendeur/acheteur)

Rédigé en français — liste d'actions, décisions techniques, modèles de données et checklist de tests.

---

## Objectifs fonctionnels

1. Affichage produit public (page produit)
   - Afficher toutes les informations définies par le vendeur : nom, description (RTE), galerie, image de couverture, prix, prix d'origine, libellé promo, disponibilité, variantes, options de livraison, sections de page de vente (hero, listes, cta, faq) si activées.
   - Respecter les réglages d'apparence de la boutique (couleurs primaires/CTA, police, interligne) et les appliquer en priorité quand le vendeur l'a configuré.
   - Bouton CTA sur la page produit : couleur, texte et URL configurables (par produit ou par boutique selon la décision) et rendu accessible (contraste texte/icone).
   - Prévisualisation live dans l'éditeur vendeur qui reflète 1:1 ce que verra l'acheteur.

2. Édition / prévisualisation vendeur
   - L'interface d'édition doit initialiser ses états depuis l'API produit (product.image_url, product.metadata.gallery, product.metadata.salesPage).
   - Si l'image est uniquement dans metadata.gallery (produits anciens), utiliser la première image comme fallback pour la couverture et proposer de normaliser (migrer) le champ image_url à la sauvegarde.
   - Le Rich Text Editor doit sauvegarder et restituer les attributs typographiques (font-family, font-size, line-height) et types de bloc (h1..h3, listes) ; le rendu public doit appliquer ces mêmes styles.
   - Les toggles "Contenu visible sur la boutique" (bannière, catégories, avis, réseaux sociaux, sections) doivent avoir un mapping simple pour la propriété shop.metadata.visibility et être appliqués côté public.

3. Paiement (exigences métiers)
   - Système de paiement complet, pas seulement un panier : permettre l'achat immédiat depuis la fiche produit (Buy Now) et via panier/boutique.
   - Intégrer Fedapay comme fournisseur de paiement principal (utilisation de la clé API serveur). Supporter en frontend les moyens locaux Moov et MTN Mobile Money via l'intégration Fedapay ou endpoints directs si nécessaire.
   - Mode d'intégration recommandé : utilisation des sessions de paiement Fedapay (checkout/service côté serveur) pour réduire la surface PCI, puis étendre si besoin à une intégration plus fine côté client.
   - Gestion des webhooks / callbacks Fedapay pour événements de paiement réussis, échoués et remboursements.
   - Stocker un enregistrement d'ordre et de paiement côté serveur (DB) _avant_ redirection vers le paiement (order: pending → payment_pending → paid / failed) et lier le payment record au provider (id fourni par Fedapay).
   - Notifications : email/SMS/in-app pour l'acheteur (confirmation, reçu) et pour le vendeur (nouvelle commande, paiement OK, expédition requise). Inclure informations claires sur méthodes de paiement (Moov / MTN MoMo).
   - Flux de livraison : permettre au vendeur de renseigner options (local pickup, livraison locale avec frais et délai) et de communiquer un état d'expédition et un numéro de tracking.
   - Remboursement / litiges : prévoir endpoints pour initier un remboursement via Fedapay et un process côté plateforme pour consigner la demande et notifier les parties.

---

## Décisions à prendre avant implémentation

1. Couleur CTA : par-produit ou par-boutique ?
   - Par-produit (current): product.metadata.salesPage.ctaColor
   - Par-boutique (global): shop.metadata.appearance.ctaColor
   - Recommandation : commencer par par-produit (déjà en place) et proposer migration vers shop-level plus tard.

2. Mode de paiement d'entrée de gamme
   - Recommandation : Fedapay comme fournisseur principal. Utiliser les sessions/checkout Fedapay côté serveur et gérer les webhooks/callbacks. Supporter Moov et MTN Mobile Money via les intégrations Fedapay ou endpoints partenaires.
   - Variables d'environnement à prévoir : FEDAPAY_API_KEY, FEDAPAY_WEBHOOK_SECRET, FEDAPAY_ENV (test|prod) et éventuellement MOOV_API_KEY / MTN_MOMO_API_KEY si des intégrations directes sont nécessaires.

3. Données de livraison obligatoires
   - Définir schéma minimal : shipping.name, shipping.address, shipping.city, shipping.postalCode, shipping.country, shipping.method, shipping.fee, shipping.estimatedMinDays, shipping.estimatedMaxDays.

4. Comportement d'ordre
   - Commander crée d'abord un record Order (status: pending) puis redirige vers l'étape de paiement. À webhook de paiement réussi, order.status → paid, notifie vendeur.

---

## Modèle de données (suggestion DB)

Tables principales à créer/valider :

- orders
  - id (uuid)
  - user_id (acheteur)
  - seller_id (dérivable depuis items)
  - total_amount (cents)
  - currency
  - status (pending, payment_pending, paid, cancelled, refunded, fulfilled)
  - shipping (json)  -- structure précisée ci-dessus
  - payment_provider (e.g., stripe)
  - payment_provider_id (payment_intent_id / session_id)
  - placed_at, paid_at, fulfilled_at
  - metadata (json)

- order_items
  - id
  - order_id
  - product_id
  - product_snapshot (json) // copy of title/price/etc to avoid drift
  - quantity
  - unit_price

- payments
  - id
  - order_id
  - provider
  - provider_payment_id
  - amount
  - currency
  - status
  - raw_response (json)
  - created_at

- refunds (optionnel)

- notifications (optionnel audit trail/in-app)

Important : ne pas se reposer uniquement sur la réponse du PSP ; valider côté serveur via webhook signatures.

---

## Endpoints API à implémenter/modifier

- POST /api/checkout/session
  - Créer un Order et initialiser une session de paiement Fedapay (côté serveur) pour le client.
  - Retourner l'URL de redirection ou l'id de session fourni par Fedapay.

- POST /api/webhooks/fedapay
  - Recevoir et valider les callbacks/webhooks Fedapay (signature) — gérer événements payment success / failure / refund.

- GET /api/seller/orders
  - Liste des commandes pour le vendeur (filtrer, pagination)

- POST /api/seller/orders/:id/fulfill
  - Permet au vendeur de marquer comme expédié et fournir tracking

- POST /api/seller/withdrawals
  - Créer une demande de retrait du solde vendeur (montant, méthode de retrait: compte mobile/banque).
  - Vérifier que le vendeur est vérifié (KYC) avant d'autoriser la demande.

- PATCH /api/seller/withdrawals/:id/approve (admin)
  - Endpoint pour le staff/admin pour valider/payer une demande de retrait et consigner le statut.

- POST /api/seller/verification
  - Endpoint pour que le vendeur soumette ses pièces d'identité (photo ID, selfie) et données pour vérification KYC (obligatoire avant premier retrait).

- POST /api/reports/shop
  - Permet à un utilisateur connecté de signaler une boutique : { shopId, reason, details, reporterId }.
  - Stocker et notifier l'équipe de modération.

- GET /api/admin/reports
  - Tableau pour modération listant les signalements.

- PATCH /api/seller/products/:id
  - (déjà existant) — vérifier que la sauvegarde normalise image_url si nécessaire

Note : pour les moyens mobiles (Moov, MTN MoMo), l'API checkout/session doit accepter une option de paiement par mobile money et déclencher le flux adéquat via Fedapay ou via partenaires.

---

## Checklist d'interface et d'affichage produit

Avant de commencer le dev, vérifier et préparer :

1. API Produit
   - GET /api/seller/products/:id renvoie product.image_url, product.metadata.gallery, product.metadata.salesPage (hero, ctaColor, body)
   - Si image_url manquant, décider d'une stratégie de migration (copie depuis gallery[0] sur sauvegarde automatique) ou fallback côté client (déjà ajouté)

2. Preview vendeur
   - Le composant ProductBuilderForm initialise tous ses états depuis initialData.
   - Le RichTextRenderer applique les mêmes extensions/custom marks que l'éditeur.
   - Le preview du bouton utilise pageHeroCtaColor si défini, sinon style par défaut.

3. Page publique
   - Appliquer en priorité : shop.metadata.appearance overrides (si décidés), sinon product.metadata.salesPage values.
   - Rendre toutes les sections activables (showBanner, showCategories...) via shop.metadata.visibility.

4. Images
   - next.config.js doit inclure remotePatterns/domains pour les domaines d'upload (ex: res.cloudinary.com) — vérifier déjà en place.
   - Vérifier CORS / URL d'accès depuis le navigateur et que les images sont publiques.

---

## Checklist paiements et UX

1. Compte PSP / configuration
   - Créer/espace test Fedapay (clé API serveur & secret webhook si fourni)
   - Variables d'environnement : FEDAPAY_API_KEY, FEDAPAY_WEBHOOK_SECRET, FEDAPAY_ENV (test|prod). Prévoyez MOOV_API_KEY et MTN_MOMO_API_KEY uniquement si des intégrations directes sont nécessaires hors Fedapay.

2. Sécurité
   - Webhooks / callbacks : valider la signature fournie par Fedapay avant d'appliquer tout changement d'état.
   - Ne jamais exposer la clé secrète côté client.
   - Limiter le scope des logs qui contiennent des données sensibles (tokens, numéros complets, etc.).

3. UX
   - Page de checkout rassurante : logo boutique, récapitulatif commande, montant total, frais de livraison, méthodes de paiement affichées (dont Moov / MTN MoMo).
   - Badges de sécurité et mentions sur protection des paiements et confidentialité.
   - Email récapitulatif envoyé automatiquement à l'acheteur et notification/alerte au vendeur (nouvelle commande, paiement reçu).

4. Notifications
   - Templates email (HTML simple) pour : commande reçue, paiement réussi, paiement échoué, commande expédiée, remboursement.
   - Intégration possible : SendGrid, Postmark, Amazon SES ou autre provider transactionnel.

---

## Tests & validation

- Tests unitaires : logique de création d'Order, calcul de totals, taxes/frais de livraison.
- Tests d'intégration : simuler callbacks/webhooks Fedapay et vérifier la mise à jour d'ordre/paiement.
- Tests manuels : parcours acheteur complet (création commande → paiement via Fedapay ou Mobile Money → webhook callback) en mode test.
- QA : vérifier sur mobile/desktop, parcours Mobile Money (Moov / MTN) et gestion des erreurs réseau / annulations.

---

## Monitoring & exploitation

- Logs : centraliser erreurs paiement / webhooks manqués.
- Retries : garder une file/retry pour webhooks qui échouent (worker) ou alerter l'équipe.
- Tableau de bord vendeur : liste des commandes, filtre état (pending/paid/fulfilled/refunded).

---

## Retraits & vérification des vendeurs (KYC)

- Processus de retrait
  - Le vendeur peut demander un retrait de son solde via /api/seller/withdrawals en choisissant la méthode (mobile money ou virement selon disponibilité).
  - Les retraits restent en statut "pending" tant que l'équipe (ou un process automatisé) ne les a pas validés et exécutés.
  - Les demandes de retrait doivent être historisées (montant, méthode, frais, statut, timestamps).

- Vérification d'identité (KYC)
  - Avant le premier retrait, le vendeur doit fournir une pièce d'identité valide (photo recto/verso si applicable) et un selfie pour vérification.
  - Endpoint /api/seller/verification pour soumettre des documents et les métadonnées (nom complet, date de naissance, pays, pièce fournie).
  - Processus de modération/validation : automatisé si possible (OCR / fournisseurs KYC) ou via revue manuelle par l'équipe.
  - Tant que le vendeur n'est pas vérifié, masquer l'option de retrait (ou indiquer "retiré non autorisé — vérification requise").

- Règles supplémentaires
  - Plafonds de retrait minimum/maximum, délai de traitement estimé et frais appliqués.
  - Vérifier la correspondance entre le nom du compte destinataire et les informations KYC pour limiter la fraude.

---

## Signalement de boutiques (report)

- Endpoint /api/reports/shop
  - Utilisateurs connectés peuvent signaler une boutique avec { shopId, reasonCode, details, reporterId }.
  - Motifs standard : contenu frauduleux, non-respect des règles, escroquerie, produits interdits, spam.

- Workflow de modération
  - Stocker le signalement et notifier l'équipe de modération.
  - Mettre en place un tableau d'administration (/admin/reports) pour traiter les signalements (verifier, suspendre, fermer).
  - Si plusieurs signalements sérieux, prévoir blocage temporaire automatique en attente de revue (alerter vendeur par email).

---

## Politiques & règlements (à finaliser avant lancement)

- Règles du vendeur
  - Conditions d'inscription et d'usage pour vendre : types de produits autorisés/interdits, obligations de livraison, service client et garanties.
  - Politique de frais et commissions : pourcentage prélevé, frais fixes par transaction si applicables.

- Politique de retrait
  - Délais de traitement, montants minimums, identification requise pour les retraits, politiques de vérification.

- Politique de remboursement & litiges
  - Conditions de remboursement, procédure de contestation, rôle de la plateforme dans la médiation.

- Politique de modération
  - Comment les signalements sont traités, sanctions possibles (avertissement, suspension, suppression de la boutique), droit de réponse du vendeur.

- Respect de la réglementation locale
  - Vérifier conformité fiscale (facturation), protection des données personnelles (RGPD/loi locale) et règles de commerce en ligne du pays ciblé.

---

## Étapes d'implémentation proposées (priorisées)

1. Stabiliser l'affichage et la preview
   - s'assurer que ProductBuilderForm initialise imageUrl depuis product.image_url ou metadata.gallery[0]
   - faire le rendu de la CTA avec la couleur choisie
   - rendre le RTE pleinement persistant (police/taille/interligne)
   - tests manuels sur quelques produits (anciens/nouveaux)

2. Mettre en place modèle Order & endpoints de base
   - créer tables orders, order_items, payments
   - endpoint POST /api/checkout/session -> crée order + initialise une session Fedapay (retourne l'URL de paiement)

3. Webhooks et post-paiement
   - endpoint /api/webhooks/fedapay (valider signature) → mise à jour order/payment → notifications

4. UX/Emails
   - templates email, envoi à l'acheteur et au vendeur

5. Améliorations
   - support poussé Mobile Money (Moov / MTN), suivi de livraison, refunds, tableau vendeur complet

---

## Questions / points à confirmer

1. Souhaites-tu que la couleur CTA devienne globale (niveau boutique) ou on reste par-produit ?
2. Confirmer : fournisseur de paiement principal = Fedapay (avec Moov & MTN MoMo comme moyens supportés) ?
3. Souhaites-tu que les anciens produits soient automatiquement migrés (copier metadata.gallery[0] → image_url) lors d'une sauvegarde produit ?
4. Gestion des paiements marketplace : souhaites-tu un modèle où la plateforme encaisse puis reverse, ou un split direct (connect/marketplace) géré par Fedapay/partenaires ?

---

## Livrables attendus après approbation

- Endpoint de checkout fonctionnel (Fedapay) + webhook
- Système de retrait pour vendeurs (demandes, validation, historique)
- Ordres persistés et notifications envoyées
- Fiche produit publique + preview vendeur reflétant tous les paramètres d'apparence
- Documentation technique courte et checklist QA

---

Si tu es d'accord avec ces orientations je peux commencer par :
- implémenter l'endpoint POST /api/checkout/session avec Fedapay (mode test)
- créer la table orders + order_items + payments + withdrawals (migration)
- ajouter tests d'intégration pour les callbacks Fedapay

Dis quelle première tâche prioriser ou réponds aux questions listées plus haut.