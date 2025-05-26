CREATE TYPE "public"."place_sources" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."place_types" AS ENUM('restaurant', 'trail');--> statement-breakpoint
CREATE TABLE "places" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "places_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"type" "place_types" NOT NULL,
	"description" text,
	"address" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"roadAddress" text,
	"phone" text,
	"homepage" text,
	"instagram" text,
	"naver" text,
	"source" "place_sources" DEFAULT 'admin' NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
