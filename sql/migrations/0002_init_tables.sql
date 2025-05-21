-- Add role column to profiles table
ALTER TABLE "profiles" 
ADD COLUMN "role" text NOT NULL DEFAULT 'user'::text;

-- Create types for enums
CREATE TYPE place_type AS ENUM ('restaurant', 'walk');
CREATE TYPE price_level AS ENUM ('cheap', 'moderate', 'expensive');
CREATE TYPE submission_status AS ENUM ('pending', 'approved', 'rejected');

-- Create places table
CREATE TABLE "places" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" place_type NOT NULL,
  "name" text NOT NULL,
  "address" text NOT NULL,
  "lat" float8 NOT NULL,
  "lng" float8 NOT NULL,
  "price_level" price_level,
  "honbab_score" integer NOT NULL DEFAULT 0,
  "image_url" text,
  "source" text NOT NULL DEFAULT 'user_submission',
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT honbab_score_check CHECK (honbab_score >= 0 AND honbab_score <= 100)
);

-- Create reviews table
CREATE TABLE "reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "profiles"("profile_id") ON DELETE CASCADE,
  "place_id" uuid NOT NULL REFERENCES "places"("id") ON DELETE CASCADE,
  "rating" integer NOT NULL,
  "text" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rating_check CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT unique_user_place_review UNIQUE (user_id, place_id)
);

-- Create submissions table
CREATE TABLE "submissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid REFERENCES "profiles"("profile_id") ON DELETE SET NULL,
  "place_type" place_type NOT NULL,
  "place_name" text NOT NULL,
  "address" text NOT NULL,
  "lat" float8,
  "lng" float8,
  "details" text,
  "status" submission_status NOT NULL DEFAULT 'pending',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

-- Create favorites table
CREATE TABLE "favorites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "profiles"("profile_id") ON DELETE CASCADE,
  "place_id" uuid NOT NULL REFERENCES "places"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_place_favorite UNIQUE (user_id, place_id)
);

-- Create tags table
CREATE TABLE "tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" text NOT NULL,
  "label" text NOT NULL,
  "description" text NOT NULL,
  "type" place_type NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_key_per_type UNIQUE (key, type)
);

-- Create place_tags junction table
CREATE TABLE "place_tags" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "place_id" uuid NOT NULL REFERENCES "places"("id") ON DELETE CASCADE,
  "tag_id" uuid NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_place_tag UNIQUE (place_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_places_location ON "places" (lat, lng);
CREATE INDEX idx_reviews_place_id ON "reviews" (place_id);
CREATE INDEX idx_favorites_user_id ON "favorites" (user_id);
CREATE INDEX idx_place_tags_place_id ON "place_tags" (place_id);
CREATE INDEX idx_place_tags_tag_id ON "place_tags" (tag_id);

-- Enable Row Level Security on all tables
ALTER TABLE "places" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "favorites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "place_tags" ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON COLUMN "profiles"."role" IS 'User role: user or admin';
COMMENT ON TABLE "places" IS 'Stores information about places (restaurants, walking routes, etc.)';
COMMENT ON TABLE "reviews" IS 'User reviews for places';
COMMENT ON TABLE "submissions" IS 'User submissions for new places';
COMMENT ON TABLE "favorites" IS 'User favorite places';
COMMENT ON TABLE "tags" IS 'Available tags for places';
COMMENT ON TABLE "place_tags" IS 'Junction table for many-to-many relationship between places and tags';