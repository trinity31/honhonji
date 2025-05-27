ALTER TABLE "place_favorites" RENAME TO "place_likes";--> statement-breakpoint
ALTER TABLE "place_likes" DROP CONSTRAINT "place_favorites_place_id_places_id_fk";
--> statement-breakpoint
ALTER TABLE "place_likes" DROP CONSTRAINT "place_favorites_profile_id_profiles_profile_id_fk";
--> statement-breakpoint
ALTER TABLE "place_likes" DROP CONSTRAINT "place_favorites_place_id_profile_id_pk";--> statement-breakpoint
ALTER TABLE "places" ALTER COLUMN "stats" SET DEFAULT '{"views":0,"reviews":0,"likes":0}'::jsonb;--> statement-breakpoint
ALTER TABLE "place_likes" ADD CONSTRAINT "place_likes_place_id_profile_id_pk" PRIMARY KEY("place_id","profile_id");--> statement-breakpoint
ALTER TABLE "place_likes" ADD CONSTRAINT "place_likes_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_likes" ADD CONSTRAINT "place_likes_profile_id_profiles_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("profile_id") ON DELETE cascade ON UPDATE no action;