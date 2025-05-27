import { relations, sql } from "drizzle-orm";
import {
  bigint,
  check,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { timestamps } from "~/core/db/helpers.server";

import { profiles } from "../users/schema";
import { PLACE_TYPES } from "./constants";
import { TAG_CATEGORIES } from "./constants";

export const placeTypes = pgEnum(
  "place_types",
  PLACE_TYPES.map((type) => type.value) as [string, ...string[]],
);

export const tag_category = pgEnum(
  "tag_category",
  TAG_CATEGORIES.map((type) => type.value) as [string, ...string[]],
);

export const placeStatus = pgEnum("place_status", [
  "pending",
  "approved",
  "rejected",
]);

export const placeSources = pgEnum("place_sources", ["user", "admin"]);

export const places = pgTable("places", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  type: placeTypes().notNull(),
  status: placeStatus().notNull().default("pending"),
  description: text(),
  address: text(),
  roadAddress: text(),
  lat: doublePrecision(),
  lng: doublePrecision(),
  phone: text(),
  homepage: text(),
  instagram: text(),
  naver: text(),
  source: placeSources().notNull().default("admin"),
  image_url: text(),
  submitted_by: uuid().references(() => profiles.profile_id, {
    onDelete: "set null",
  }),
  stats: jsonb().notNull().default({ views: 0, reviews: 0, likes: 0 }),
  ...timestamps,
});

export const tags = pgTable("tags", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
  category: tag_category(),
  description: text(),
  displayOrder: integer().notNull().default(0),
  ...timestamps,
});

export const placeToTags = pgTable(
  "place_to_tags",
  {
    place_id: bigint({ mode: "number" })
      .notNull()
      .references(() => places.id, { onDelete: "set null" }),
    tag_id: bigint({ mode: "number" })
      .notNull()
      .references(() => tags.id, { onDelete: "set null" }),
  },
  (table) => [primaryKey({ columns: [table.place_id, table.tag_id] })],
);

export const placesRelations = relations(places, ({ many }) => ({
  placesToTags: many(placeToTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  placesToTags: many(placeToTags),
}));

export const placeToTagsRelations = relations(placeToTags, ({ one }) => ({
  place: one(places, {
    fields: [placeToTags.place_id],
    references: [places.id],
  }),
  tag: one(tags, {
    fields: [placeToTags.tag_id],
    references: [tags.id],
  }),
}));

export const placeLikes = pgTable(
  "place_likes",
  {
    place_id: bigint({ mode: "number" })
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    profile_id: uuid().references(() => profiles.profile_id, {
      onDelete: "cascade",
    }),
  },
  (table) => [primaryKey({ columns: [table.place_id, table.profile_id] })],
);

export const reviews = pgTable(
  "reviews",
  {
    review_id: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    place_id: bigint({ mode: "number" })
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    profile_id: uuid().references(() => profiles.profile_id, {
      onDelete: "cascade",
    }),
    content: text().notNull(),
    rating: integer().notNull(),
    ...timestamps,
  },
  (table) => [check("rating_check", sql`${table.rating} BETWEEN 1 AND 5`)],
);
