CREATE TABLE IF NOT EXISTS "withdrawals" (
	"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
	"seller_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" text NOT NULL,
	"account" jsonb,
	"provider_id" text,
	"status" text NOT NULL DEFAULT 'PENDING',
	"processed_at" timestamptz(6),
	"created_at" timestamptz(6) NOT NULL DEFAULT now(),
	"updated_at" timestamptz(6) NOT NULL DEFAULT now(),
	CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "withdrawals" ADD COLUMN IF NOT EXISTS "provider_id" text;

DO $$ BEGIN
	ALTER TABLE "withdrawals"
		ADD CONSTRAINT "withdrawals_seller_id_fkey"
		FOREIGN KEY ("seller_id") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "withdrawals_seller_id_idx" ON "withdrawals"("seller_id");
CREATE INDEX IF NOT EXISTS "withdrawals_status_idx" ON "withdrawals"("status");