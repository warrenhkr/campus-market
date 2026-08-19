-- Migration: enrichit les avis produits avec le statut "achat vérifié"
-- et la possibilité pour le vendeur de répondre publiquement à un avis.
-- Additive et non destructive.

ALTER TABLE "reviews"
  ADD COLUMN IF NOT EXISTS "is_verified_purchase" boolean NOT NULL DEFAULT false;

ALTER TABLE "reviews"
  ADD COLUMN IF NOT EXISTS "seller_reply" text;

ALTER TABLE "reviews"
  ADD COLUMN IF NOT EXISTS "seller_reply_at" timestamptz(6);
