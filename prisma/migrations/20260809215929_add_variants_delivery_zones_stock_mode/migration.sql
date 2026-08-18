-- Migration: variantes et zones de livraison en tables relationnelles,
-- + mode de stock structuré sur products. Remplace progressivement les
-- champs équivalents actuellement stockés dans products.metadata (JSON).
--
-- Cette migration est additive et non destructive :
--  - Les nouvelles colonnes ont des valeurs par défaut sûres.
--  - products.metadata n'est PAS modifié ni supprimé par cette migration.
--  - Un backfill copie les variantes / zones déjà saisies par les vendeurs
--    depuis metadata vers les nouvelles tables, sans rien effacer.
-- Le nettoyage de metadata (retrait de "variants" et "delivery.zones")
-- est volontairement laissé à une migration ultérieure, une fois le code
-- applicatif basculé et vérifié en production.

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "stock_mode" AS ENUM ('UNLIMITED', 'TRACKED', 'PREORDER', 'OUT_OF_STOCK');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable: nouvelles colonnes sur products
ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "stock_mode" "stock_mode" NOT NULL DEFAULT 'TRACKED';

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "low_stock_threshold" integer;

ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "allow_backorder" boolean NOT NULL DEFAULT false;

-- CreateTable: product_variants
CREATE TABLE IF NOT EXISTS "product_variants" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "product_id" uuid NOT NULL,
  "name" text NOT NULL,
  "price_delta" numeric(10, 2) NOT NULL DEFAULT 0,
  "stock_delta" integer NOT NULL DEFAULT 0,
  "sku" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "position" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),

  CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable: product_delivery_zones
CREATE TABLE IF NOT EXISTS "product_delivery_zones" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "product_id" uuid NOT NULL,
  "name" text NOT NULL,
  "fee" numeric(10, 2),
  "estimated_min_days" integer,
  "estimated_max_days" integer,
  "is_active" boolean NOT NULL DEFAULT true,
  "position" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),

  CONSTRAINT "product_delivery_zones_pkey" PRIMARY KEY ("id")
);

-- AlterTable: rattacher order_items à la variante achetée (facultatif, n'affecte pas les commandes existantes)
ALTER TABLE "order_items"
  ADD COLUMN IF NOT EXISTS "variant_id" uuid;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "product_delivery_zones"
    ADD CONSTRAINT "product_delivery_zones_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "order_items"
    ADD CONSTRAINT "order_items_variant_id_fkey"
    FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "product_variants_product_id_idx" ON "product_variants"("product_id");
CREATE INDEX IF NOT EXISTS "product_delivery_zones_product_id_idx" ON "product_delivery_zones"("product_id");

-- Backfill: copie des variantes déjà saisies dans metadata.variants (JSON) vers product_variants.
-- Idempotent : ne réinsère rien si des variantes existent déjà pour le produit.
INSERT INTO "product_variants" ("product_id", "name", "price_delta", "stock_delta", "position")
SELECT
  p."id",
  COALESCE(NULLIF(TRIM(v.value->>'name'), ''), 'Variante'),
  COALESCE(NULLIF(v.value->>'priceDelta', '')::numeric, 0),
  COALESCE(NULLIF(v.value->>'stockDelta', '')::int, 0),
  v.ordinality - 1
FROM "products" p,
  LATERAL jsonb_array_elements(
    CASE
      WHEN jsonb_typeof(p."metadata"->'variants') = 'array' THEN p."metadata"->'variants'
      ELSE '[]'::jsonb
    END
  ) WITH ORDINALITY AS v(value, ordinality)
WHERE NOT EXISTS (
  SELECT 1 FROM "product_variants" pv WHERE pv."product_id" = p."id"
);

-- Backfill: copie des zones de livraison déjà saisies dans metadata.delivery.zones (JSON)
-- vers product_delivery_zones. Idempotent de la même façon.
INSERT INTO "product_delivery_zones" ("product_id", "name", "fee", "estimated_min_days", "estimated_max_days", "is_active", "position")
SELECT
  p."id",
  COALESCE(NULLIF(TRIM(z.value->>'name'), ''), 'Zone'),
  NULLIF(z.value->>'fee', '')::numeric,
  NULLIF(z.value->>'estimatedMinDays', '')::int,
  NULLIF(z.value->>'estimatedMaxDays', '')::int,
  COALESCE((z.value->>'isActive')::boolean, true),
  z.ordinality - 1
FROM "products" p,
  LATERAL jsonb_array_elements(
    CASE
      WHEN jsonb_typeof(p."metadata"->'delivery'->'zones') = 'array' THEN p."metadata"->'delivery'->'zones'
      ELSE '[]'::jsonb
    END
  ) WITH ORDINALITY AS z(value, ordinality)
WHERE NOT EXISTS (
  SELECT 1 FROM "product_delivery_zones" pdz WHERE pdz."product_id" = p."id"
);

-- Backfill: report du stockMode / lowStockThreshold / allowBackorder déjà saisis dans metadata
-- vers les nouvelles colonnes structurées, uniquement s'ils y sont présents.
UPDATE "products" p
SET "stock_mode" = UPPER(p."metadata"->>'stockMode')::"stock_mode"
WHERE p."metadata"->>'stockMode' IS NOT NULL
  AND UPPER(p."metadata"->>'stockMode') IN ('UNLIMITED', 'TRACKED', 'PREORDER', 'OUT_OF_STOCK');

UPDATE "products" p
SET "low_stock_threshold" = (p."metadata"->>'lowStockThreshold')::int
WHERE p."metadata"->>'lowStockThreshold' IS NOT NULL
  AND p."metadata"->>'lowStockThreshold' ~ '^[0-9]+$';

UPDATE "products" p
SET "allow_backorder" = (p."metadata"->>'allowBackorder')::boolean
WHERE p."metadata"->>'allowBackorder' IS NOT NULL;
