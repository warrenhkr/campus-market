-- Migration: répartition du paiement par vendeur (payment_splits).
-- Nécessaire car un Payment est 1-1 avec une Order, alors qu'une Order peut
-- contenir des articles de plusieurs boutiques différentes, chacune avec son
-- propre taux de commission selon son plan d'abonnement. Cette table calcule
-- et fige, pour chaque boutique présente dans la commande, sa part du
-- paiement, sa commission plateforme et son gain net.
-- Additive et non destructive : ne touche à aucune colonne existante.

CREATE TABLE IF NOT EXISTS "payment_splits" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "payment_id" uuid NOT NULL,
  "shop_id" uuid NOT NULL,
  "amount" numeric(10, 2) NOT NULL,
  "commission_rate" numeric(5, 4) NOT NULL,
  "platform_fee" numeric(10, 2) NOT NULL,
  "seller_earning" numeric(10, 2) NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),

  CONSTRAINT "payment_splits_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "payment_splits"
    ADD CONSTRAINT "payment_splits_payment_id_fkey"
    FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "payment_splits"
    ADD CONSTRAINT "payment_splits_shop_id_fkey"
    FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "payment_splits_payment_id_idx" ON "payment_splits"("payment_id");
CREATE INDEX IF NOT EXISTS "payment_splits_shop_id_idx" ON "payment_splits"("shop_id");
