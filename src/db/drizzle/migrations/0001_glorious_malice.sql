ALTER TABLE "patients" RENAME COLUMN "birth_date" TO "age";--> statement-breakpoint
ALTER TABLE "patients" DROP CONSTRAINT "patients_email_unique";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "email";