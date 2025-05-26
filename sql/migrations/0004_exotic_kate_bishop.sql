
CREATE TYPE "public"."submission_type" AS ENUM('new', 'update', 'removal');--> statement-breakpoint
CREATE TABLE "submission_tags" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "submission_tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"submission_id" bigint NOT NULL,
	"tag_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "submissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"type" "submission_type" NOT NULL,
	"status" "submission_status" DEFAULT 'pending' NOT NULL,
	"place_id" bigint,
	"user_id" uuid,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"name" text,
	"place_type" "place_types" NOT NULL,
	"description" text,
	"address" text DEFAULT '' NOT NULL,
	"road_address" text,
	"latitude" double precision,
	"longitude" double precision,
	"phone" text,
	"homepage" text,
	"instagram" text,
	"naver" text,
	"source" text DEFAULT 'user',
	"image_url" text,
	"tag_ids" bigint[] DEFAULT '{}',
	"admin_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
