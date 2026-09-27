# Progression d'implémentation — paiement, KYC, retraits, signalements et preview

## 1) Paiements et checkout

- [x] Intégration FedaPay déjà présente dans le code (routes /api/checkout et /api/webhook/fedapay).
- [x] Gestion du flux de paiement côté serveur et création d'Order / Payment / PaymentSplit.
- [x] Support principal avec FedaPay et moyens locaux Moov / MTN Mobile Money pris en compte dans le plan d'implémentation.
- [ ] Finaliser le flow de checkout complet avec choix de moyen et propre UX mobile money.
- [ ] Vérifier les cas d'erreur, callbacks et notifications côté vendeur/acheteur.

## 2) Vérification vendeur / KYC

- [x] Endpoint ajouté : /api/seller/verification
- [x] Les pièces d'identité peuvent être enregistrées en utilisant les uploads Cloudinary existants.
- [x] Les documents sont stockés dans storeMedia avec uploader_id = utilisateur connecté.
- [x] Le statut seller.verification_status est remis en PENDING quand des documents sont soumis.
- [x] Le flux est désormais facultatif et ne bloque plus l’accès à la vente ni les retraits.
- [ ] Ajouter le workflow complet d'approbation / rejet par l'admin si un jour une validation renforcée est nécessaire.
- [x] Ajouter l'UI vendeur pour uploader les documents et consulter l'état KYC. (components/seller/SellerKycForm & app/(main)/seller/settings/verification.tsx)

## 3) Retraits vendeur

- [x] Modèle Withdrawal ajouté à prisma/schema.prisma.
- [x] Endpoint ajouté : /api/seller/withdrawals (GET/POST).
- [x] Vérification KYC facultative, sans blocage du retrait.
- [x] Le retrait est enregistré en statut PENDING.
- [ ] Ajouter l'endpoint d'admin pour valider ou refuser les retraits.
- [x] Ajouter l'UI vendeur pour demander un retrait et consulter l'historique. (components/seller/SellerWithdrawals & app/(main)/seller/withdrawals.tsx)

## 4) Signalement de boutiques

- [x] Endpoint ajouté : /api/reports/shop.
- [x] Le signalement est lié au vendeur concerné via le shop.seller_id.
- [x] Le moti/description du signalement est stocké en base.
- [x] Endpoint admin ajouté : /api/admin/reports (GET / PATCH).
- [x] Ajouter l'UI de modération admin pour traiter les signalements.
- [ ] Ajouter les notifications d'alerte et le workflow de suspension/validation.

## 5) Politiques / règlements / conformité

- [x] Documentation ajoutée dans SELLER_PAYMENT_AND_PREVIEW_PLAN.md.
- [x] Points couverts : règles vendeur, retrait, remboursement, modération, conformité locale.
- [x] Documentation de base ajoutée dans docs/politique-confidentialite-et-regles-vendeur.md.
- [x] Les politiques sont rendues visibles dans le front office via /legal, /legal/confidentialite, /legal/conditions et /legal/vendeur.
- [x] Ajouter les pages d'affichage public des conditions générales, confidentialité et règles vendeur.

## 5b) Finalisation de la phase paiement vendeur / mode live

- [x] Le plan de finalisation est documenté dans SELLER_PAYMENT_AND_PREVIEW_PLAN.md.
- [x] Les demandes de retrait vendeur, KYC et signalements sont déjà en place au niveau de base.
- [x] Le panneau `/admin/payments` persiste le mode dans `settings.fedapay_mode`; les clés restent dans les variables secrètes du déploiement, pas en base ni dans l'interface.
- [x] Le live exige `FEDAPAY_LIVE_SECRET_KEY`, `FEDAPAY_LIVE_WEBHOOK_SECRET` et une URL publique HTTPS (`NEXT_PUBLIC_APP_URL` ou `APP_URL`). La clé publique n'est pas requise par le checkout serveur actuel.
- [x] Le checkout bloque une configuration incomplète avant de créer la commande; l'admin payouts n'emploie plus la clé sandbox comme fallback live.
- [x] La vérification du webhook suit le schéma officiel FedaPay `HMAC-SHA256(timestamp.corps_brut)` et les erreurs internes déclenchent une réponse 500 pour permettre les retries.
- [x] Le propriétaire rapporte un test sandbox réussi.
- [ ] Après ajout des secrets, enregistrer le webhook dans le compte live, activer le mode depuis `/admin/payments` et vérifier une transaction réelle de bout en bout.
- [ ] Si les payouts vendeur doivent être live, configurer et tester aussi le projet `campus-market-admin` (`FEDAPAY_ENV=live`, `FEDAPAY_LIVE_SECRET_KEY`).

## 6) Affichage produit / preview vendeur

- [x] Correction du type ctaColor dans les métadonnées salesPage et public product page.
- [x] Correction des imports Tiptap TextStyle pour le compilateur.
- [x] Validation TypeScript rétablie (npx tsc --noEmit OK).
- [ ] Finaliser la preview live des choix de couleur CTA, police, taille et interligne sur le mode éditeur.
- [ ] Vérifier la cohérence complète des styles de page de vente côté vendeur/public.

## 7) Choix techniques retenus

- [x] Utilisation de Cloudinary déjà présente pour les uploads de documents et images.
- [x] Le stockage des KYC se fait par StoreMedia avec uploader_id = utilisateur concerné.
- [x] Les endpoints de vente / admin / KYC utilisent les patterns existants du projet (Supabase auth + Prisma).

## 8) Fichiers créés / modifiés

- [x] prisma/schema.prisma
- [x] app/api/seller/verification/route.ts
- [x] app/api/seller/withdrawals/route.ts
- [x] app/api/reports/shop/route.ts
- [x] app/api/admin/reports/route.ts
- [x] components/seller/SellerKycForm.tsx
- [x] components/seller/SellerWithdrawals.tsx
- [x] app/(main)/seller/settings/verification.tsx
- [x] app/(main)/seller/withdrawals.tsx
- [x] SELLER_PAYMENT_AND_PREVIEW_PLAN.md
- [x] IMPLEMENTATION_PROGRESS.md

## 9) Vérification

- [x] npx tsc --noEmit : OK
- [x] prisma generate : OK

## Prochaine étape recommandée

- Ajouter l'interface vendeur pour KYC + retrait + historique.
- Ensuite, finaliser l'UI admin de modération pour les signalements et les demandes de retrait.
