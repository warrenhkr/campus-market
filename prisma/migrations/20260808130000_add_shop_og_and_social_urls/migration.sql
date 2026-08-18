-- Migration: add og_image_url, og_image_public_id, tiktok_url and youtube_url to shops

ALTER TABLE "shops"
ADD COLUMN IF NOT EXISTS "og_image_url" text;

ALTER TABLE "shops"
ADD COLUMN IF NOT EXISTS "og_image_public_id" text;

ALTER TABLE "shops"
ADD COLUMN IF NOT EXISTS "tiktok_url" text;

ALTER TABLE "shops"
ADD COLUMN IF NOT EXISTS "youtube_url" text;
