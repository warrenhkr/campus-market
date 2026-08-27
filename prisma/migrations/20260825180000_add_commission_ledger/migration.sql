-- Immutable accounting entries created when a payment split is captured.
CREATE TYPE "commission_entry_status" AS ENUM ('AVAILABLE', 'REVERSED');

CREATE TABLE "commission_entries" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "payment_id" uuid NOT NULL,
  "payment_split_id" uuid NOT NULL,
  "shop_id" uuid NOT NULL,
  "platform_fee" numeric(10, 2) NOT NULL,
  "seller_earning" numeric(10, 2) NOT NULL,
  "status" "commission_entry_status" NOT NULL DEFAULT 'AVAILABLE',
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "commission_entries_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "commission_entries_payment_split_id_key" UNIQUE ("payment_split_id"),
  CONSTRAINT "commission_entries_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "commission_entries_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "commission_entries_payment_id_idx" ON "commission_entries"("payment_id");
CREATE INDEX "commission_entries_shop_id_status_idx" ON "commission_entries"("shop_id", "status");