CREATE ROLE "admin";--> statement-breakpoint
ALTER TABLE "place_likes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "place_to_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "places" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "place_to_tags" DROP CONSTRAINT "place_to_tags_place_id_places_id_fk";
--> statement-breakpoint
ALTER TABLE "place_to_tags" DROP CONSTRAINT "place_to_tags_tag_id_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "place_to_tags" ADD CONSTRAINT "place_to_tags_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_to_tags" ADD CONSTRAINT "place_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "placeLikes_public_select" ON "place_likes" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "placeLikes_auth_insert" ON "place_likes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (profile_id = auth.uid());--> statement-breakpoint
CREATE POLICY "placeLikes_auth_delete" ON "place_likes" AS PERMISSIVE FOR DELETE TO "authenticated" USING (profile_id = auth.uid());--> statement-breakpoint
CREATE POLICY "placeToTags_public_select" ON "place_to_tags" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "placeToTags_admin_insert" ON "place_to_tags" AS PERMISSIVE FOR INSERT TO "admin" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "placeToTags_admin_delete" ON "place_to_tags" AS PERMISSIVE FOR DELETE TO "admin" USING (true);--> statement-breakpoint
CREATE POLICY "places_public_select" ON "places" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "places_auth_insert" ON "places" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "places_admin_update" ON "places" AS PERMISSIVE FOR UPDATE TO "admin" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "places_admin_delete" ON "places" AS PERMISSIVE FOR DELETE TO "admin" USING (true);--> statement-breakpoint
CREATE POLICY "reviews_public_select" ON "reviews" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "reviews_auth_insert" ON "reviews" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (profile_id = auth.uid() AND place_id IS NOT NULL);--> statement-breakpoint
CREATE POLICY "reviews_auth_update" ON "reviews" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid() AND place_id IS NOT NULL);--> statement-breakpoint
CREATE POLICY "reviews_auth_delete" ON "reviews" AS PERMISSIVE FOR DELETE TO "authenticated" USING (profile_id = auth.uid());--> statement-breakpoint
CREATE POLICY "reviews_admin_delete" ON "reviews" AS PERMISSIVE FOR DELETE TO "admin" USING (true);--> statement-breakpoint
CREATE POLICY "tags_public_select" ON "tags" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "tags_admin_insert" ON "tags" AS PERMISSIVE FOR INSERT TO "admin" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tags_admin_update" ON "tags" AS PERMISSIVE FOR UPDATE TO "admin" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "tags_admin_delete" ON "tags" AS PERMISSIVE FOR DELETE TO "admin" USING (true);