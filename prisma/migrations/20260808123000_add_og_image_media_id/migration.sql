-- Migration: add og_image_media_id to shops

ALTER TABLE "shops"
ADD COLUMN IF NOT EXISTS "og_image_media_id" uuid;
