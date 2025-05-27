CREATE TABLE "tag_categories" (
	"category_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tag_categories_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tag_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "category_id" bigint;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_category_id_tag_categories_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."tag_categories"("category_id") ON DELETE set null ON UPDATE no action;