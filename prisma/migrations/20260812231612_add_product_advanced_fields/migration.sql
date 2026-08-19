-- Migration: fonctionnalités avancées de fiche produit (inspirées d'une
-- comparaison avec un éditeur de référence du marché) : slug produit,
-- promo avec période + renouvellement auto, exclusivité (limite de ventes,
-- masquage), réapprovisionnement automatique, instructions post-achat,
-- protection de fichiers numériques, SEO dédié à la fiche produit, FAQ
-- réordonnable et tarifs alternatifs.
-- Additive et non destructive.

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "product_faq_layout" AS ENUM ('ACCORDION', 'GRID', 'LIST');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable: nouvelles colonnes sur products
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "slug" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "promo_start_at" timestamptz(6);
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "promo_auto_renew" boolean NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_hidden_from_shop" boolean NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "hide_sales_count" boolean NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sales_limit" integer;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "restock_threshold" integer;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "restock_quantity" integer;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "post_purchase_instructions" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "require_shipping_address" boolean NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "file_password" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "watermark_files" boolean NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_title" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_description" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_thumbnail_url" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "seo_keywords" text;

-- CreateTable: product_faqs
CREATE TABLE IF NOT EXISTS "product_faqs" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "product_id" uuid NOT NULL,
  "question" text NOT NULL,
  "answer" text NOT NULL,
  "is_published" boolean NOT NULL DEFAULT true,
  "layout" "product_faq_layout" NOT NULL DEFAULT 'ACCORDION',
  "position" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),

  CONSTRAINT "product_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: product_pricing_tiers
CREATE TABLE IF NOT EXISTS "product_pricing_tiers" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "product_id" uuid NOT NULL,
  "label" text NOT NULL,
  "price" numeric(10, 2) NOT NULL,
  "is_default" boolean NOT NULL DEFAULT false,
  "position" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),

  CONSTRAINT "product_pricing_tiers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "product_faqs"
    ADD CONSTRAINT "product_faqs_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "product_pricing_tiers"
    ADD CONSTRAINT "product_pricing_tiers_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "product_faqs_product_id_idx" ON "product_faqs"("product_id");
CREATE INDEX IF NOT EXISTS "product_pricing_tiers_product_id_idx" ON "product_pricing_tiers"("product_id");

-- Unicité du slug produit par boutique (deux boutiques différentes peuvent
-- réutiliser le même slug, mais pas deux produits d'une même boutique)
CREATE UNIQUE INDEX IF NOT EXISTS "products_shop_id_slug_key" ON "products"("shop_id", "slug") WHERE "slug" IS NOT NULL;
