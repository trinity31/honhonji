CREATE TABLE "course_places" (
	"course_id" bigint NOT NULL,
	"place_id" bigint NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "course_places_course_id_place_id_pk" PRIMARY KEY("course_id","place_id")
);
--> statement-breakpoint
ALTER TABLE "course_places" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "courses" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text,
	"profile_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "course_places" ADD CONSTRAINT "course_places_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_places" ADD CONSTRAINT "course_places_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "course_places_public_select" ON "course_places" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "course_places_auth_insert" ON "course_places" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
        SELECT 1 FROM "courses" 
        WHERE "courses".id = "course_places"."course_id" 
        AND "courses".profile_id = auth.uid()
      ));--> statement-breakpoint
CREATE POLICY "course_places_auth_update" ON "course_places" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM "courses" 
        WHERE "courses".id = "course_places"."course_id" 
        AND "courses".profile_id = auth.uid()
      )) WITH CHECK (EXISTS (
        SELECT 1 FROM "courses" 
        WHERE "courses".id = "course_places"."course_id" 
        AND "courses".profile_id = auth.uid()
      ));--> statement-breakpoint
CREATE POLICY "course_places_auth_delete" ON "course_places" AS PERMISSIVE FOR DELETE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM "courses" 
        WHERE "courses".id = "course_places"."course_id" 
        AND "courses".profile_id = auth.uid()
      ));--> statement-breakpoint
CREATE POLICY "course_places_admin_all" ON "course_places" AS PERMISSIVE FOR ALL TO "admin" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "courses_public_select" ON "courses" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "courses_auth_insert" ON "courses" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (profile_id = auth.uid());--> statement-breakpoint
CREATE POLICY "courses_auth_update" ON "courses" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());--> statement-breakpoint
CREATE POLICY "courses_auth_delete" ON "courses" AS PERMISSIVE FOR DELETE TO "authenticated" USING (profile_id = auth.uid());--> statement-breakpoint
CREATE POLICY "courses_admin_all" ON "courses" AS PERMISSIVE FOR ALL TO "admin" USING (true) WITH CHECK (true);