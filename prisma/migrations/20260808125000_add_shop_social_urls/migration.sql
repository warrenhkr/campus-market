-- Migration: add tiktok_url and youtube_url to shops

ALTER TABLE "shops"
ADD COLUMN IF NOT EXISTS "tiktok_url" text;

ALTER TABLE "shops"
ADD COLUMN IF NOT EXISTS "youtube_url" text;
