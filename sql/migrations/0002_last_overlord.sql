-- CREATE TYPE "public"."place_sources" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."place_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
-- CREATE TYPE "public"."place_types" AS ENUM('restaurant', 'cafe', 'trail');--> statement-breakpoint
CREATE TABLE "place_to_tags" (
	"place_id" bigint NOT NULL,
	"tag_id" bigint NOT NULL,
	CONSTRAINT "place_to_tags_place_id_tag_id_pk" PRIMARY KEY("place_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "places_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"type" "place_types" NOT NULL,
	"status" "place_status" DEFAULT 'pending' NOT NULL,
	"description" text,
	"address" text,
	"roadAddress" text,
	"lat" double precision,
	"lng" double precision,
	"phone" text,
	"homepage" text,
	"instagram" text,
	"naver" text,
	"source" "place_sources" DEFAULT 'admin' NOT NULL,
	"image_url" text,
	"submitted_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "place_to_tags" ADD CONSTRAINT "place_to_tags_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_to_tags" ADD CONSTRAINT "place_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "places" ADD CONSTRAINT "places_submitted_by_profiles_profile_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."profiles"("profile_id") ON DELETE set null ON UPDATE no action;