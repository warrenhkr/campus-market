# Media Integration (Cloudinary + StoreMedia)

This document describes the endpoints, payloads and recommended flows for handling media uploads via Cloudinary and persisting their metadata in Prisma (`StoreMedia`).

## Endpoints

- `POST /api/cloudinary/upload`
  - FormData fields: `file` (File), `folder` (string), optional: `shopId`, `uploaderId`
  - Response: JSON with `url`, `public_id`, `resource_type`, `format`, `width`, `height`, `bytes`, `mediaId`
  - Behaviour: Uploads to Cloudinary (signed if credentials available), creates `StoreMedia` record when DB accessible, returns `mediaId` (or `null`).

- `POST /api/cloudinary/delete`
  - JSON body: `{ publicId: string, shopId: string }`
  - Behaviour: Verifies authenticated seller owns the `shopId`, calls Cloudinary `uploader.destroy`, clears matching `Shop` og fields, deletes matching `StoreMedia` rows for that `publicId`/`shopId`.

## Database

- `StoreMedia` model stores metadata returned by Cloudinary and references `shop_id` and `uploader_id` when available.
- Shop model fields now include:
  - `og_image_media_id` (uuid) — already added
  - `logo_media_id` (uuid) — to be added
  - `banner_media_id` (uuid) — to be added
  - `favicon_media_id` (uuid) — to be added

## Frontend flow (recommended)

1. User uploads image via `ImageUpload`:
   - `ImageUpload` sends `file` + optional `shopId` and `uploaderId`.
   - Server returns `mediaId`, `public_id`, and `url`.
   - `ImageUpload` calls `onMeta({ url, public_id, mediaId, ... })`.
2. `ShopSettingsForm` stores both `*_url` and `*_media_id` in form state.
3. On save, call `/api/seller/settings` with `{ shopId, logo_media_id, banner_media_id, favicon_media_id, og_image_media_id, ... }`.
4. Server resolves `StoreMedia` and applies `*_url`/`*_public_id`/`*_media_id` to the `Shop` record transactionally when possible.

## Security & ownership

- Deletions require authenticated seller and shop ownership.
- The server never exposes Cloudinary API secret to the client.

## Notes

- Consider centralizing media variants (transformations) by storing `public_id` and generating signed URLs when necessary.
- For audit/history, keep `StoreMedia` records even after unlinking from `Shop` (soft-delete vs hard-delete policy).

---

Created by automation: updates for StoreMedia + ShopSettings integration.
