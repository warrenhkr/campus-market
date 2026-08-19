-- Migration: add logo_media_id, banner_media_id, favicon_media_id to shops

ALTER TABLE "shops"
ADD COLUMN IF NOT EXISTS "logo_media_id" uuid;

ALTER TABLE "shops"
ADD COLUMN IF NOT EXISTS "banner_media_id" uuid;

ALTER TABLE "shops"
ADD COLUMN IF NOT EXISTS "favicon_media_id" uuid;
