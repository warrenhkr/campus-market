# Reste a faire - validations, paiements et commissions

Date: 2026-08-25

## Etat confirme

- [x] Ouverture immediate d'une boutique vendeur dans `app/api/become-seller/route.ts`.
- [x] Creation produit sans validation manuelle : le produit est cree `APPROVED`.
- [x] Modération admin des produits conservee (`APPROVED`, `REJECTED`, `HIDDEN`).
- [x] Recalcul serveur du panier : prix, disponibilité, stock, variantes et frais de livraison.
- [x] Calcul de `platform_fee` et `seller_earning` par boutique.
- [x] Creation des `PaymentSplit`.
- [x] Webhook FedaPay pour confirmer ou echouer une transaction.

## Reste prioritaire

### P0 - Paiement fiable

- [x] Remplacer les URLs FedaPay sandbox codees en dur par une URL derivee du mode configure.
- [x] Faire persister le mode live/sandbox dans `settings`; le panneau admin n'est plus un `dryRun`.
- [x] Annuler une commande si FedaPay refuse la transaction ou ne renvoie aucun identifiant.
- [x] Ajouter une idempotence robuste du webhook d'achat, y compris en cas d'evenements concurrents.
- [ ] Tester le webhook avec une signature FedaPay reelle et les differents formats d'evenement.
- [ ] Implementer un vrai remboursement FedaPay; l'admin marque actuellement seulement le paiement `REFUNDED`.

> Note FedaPay : la référence API consultée expose les transactions et les payouts, mais pas d'endpoint public de remboursement transactionnel. Ne jamais considérer le remboursement local comme un remboursement provider tant que le contrat FedaPay du compte marchand n'est pas confirmé.

### P0 - Commissions et soldes

- [x] Ajouter un ledger immuable des mouvements financiers (migration appliquee en base le 2026-08-25).
- [x] Separarer les montants vendeur et commission plateforme dans les entrees du ledger; livraison reste dans le split vendeur.
- [x] Exposer les commissions en attente et disponibles au Super Admin.
- [x] Exposer le solde vendeur disponible/en attente et l'historique des gains au vendeur.
- [x] Definir la regle initiale de disponibilite : paiement capture; une regle livraison pourra remplacer ce choix.
- [x] Ajouter les demandes de retrait vendeur et leur validation initiale du solde.
- [x] Ajouter l'interface admin d'approbation/refus; le transfert externe reste a faire.
- [ ] Ajouter les retraits de commission de la plateforme vers compte bancaire/Mobile Money.
- [x] Ajouter la file admin d'approbation/refus des retraits vendeur et lancer le payout FedaPay.
- [ ] Ajouter les contrôles de reprise après incident sur chaque retrait. (confirmation webhook payout, contrôle de solde, audit, réservation atomique et synchronisation manuelle implémentés)
- [x] Déployer la migration `20260825200000_add_withdrawal_provider_id`; la table `withdrawals` et `provider_id` sont présents en base.

### P1 - Nettoyage des controles

- [x] Supprimer l'ancien composant admin d'approbation vendeur non utilise.
- [x] Supprimer le schema admin de validation vendeur; le KYC reste obligatoire avant le premier retrait.
- [x] Bloquer côté serveur le premier retrait sans document KYC; les retraits suivants ne repassent pas par cette barrière.
- [ ] Verifier les anciens filtres `verification_status = APPROVED` dans les statistiques admin.
- [ ] Conserver les controles serveur de disponibilite produit : ils protegent le paiement et le stock.
- [ ] Ajouter des tests de regression : boutique nouvellement creee, produit visible, produit masque, vendeur rejete/suspendu, premier retrait sans KYC bloque.

### P1 - Qualite et livraison

- [x] Corriger les erreurs ESLint du front principal dans les composants KYC/retraits; le lint complet passe avec 9 warnings non bloquants dans `ProductBuilderForm`.
- [ ] Corriger les erreurs ESLint de l'admin (le build admin ignore actuellement la validation de types).
- [ ] Ajouter des tests automatises du checkout et du webhook.
- [ ] Executer la checklist manuelle FedaPay avant passage en live.

## Decoupage d'implementation

1. Nettoyage des anciens controles vendeur (termine).
2. Configuration unique des URLs et du mode FedaPay (URLs centralisees et mode persiste dans `settings`).
3. Ledger commissions et soldes, avec migration Prisma (ledger implemente et migration appliquee).
4. Retraits et ecrans Super Admin/vendeur (soldes exposes, controle vendeur, file admin, lancement, synchronisation manuelle et webhook payout implementes; reprise provider restant).
5. Tests checkout/webhook puis validation sandbox.

## Regle de securite

Ne jamais faire confiance au total, au prix, au statut ou aux frais envoyes par le navigateur. Les controles de paiement, stock, disponibilite et droits restent cote serveur.
