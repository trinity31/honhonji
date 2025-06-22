import { relations, sql } from "drizzle-orm";
import {
  bigint,
  check,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgPolicy,
  pgRole,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { anonRole, authenticatedRole, serviceRole } from "drizzle-orm/supabase";

import { timestamps } from "~/core/db/helpers.server";

import { profiles } from "../users/schema";
import { PLACE_TYPES } from "./constants";
import { TAG_CATEGORIES } from "./constants";

// Supabase JWT 의 `role` 클레임이 "admin" 인 사용자용
export const adminRole = pgRole("admin"); // 이미 DB에 있으면 .existing() 추가

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

export const places = pgTable(
  "places",
  {
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
  },
  (t) => [
    // 📖 SELECT : 모든 사용자(anon 포함)
    pgPolicy("places_public_select", {
      for: "select",
      to: "public", // anon·authenticated·admin 모두 포함
      using: sql`true`,
    }),

    // ✏️ INSERT : 로그인 사용자 & admin
    pgPolicy("places_auth_insert", {
      for: "insert",
      to: authenticatedRole, // 일반 로그인 사용자
      withCheck: sql`true`,
    }),

    // 🛠 UPDATE : 로그인 사용자 & admin
    pgPolicy("places_admin_update", {
      for: "update",
      to: adminRole,
      using: sql`true`,
      withCheck: sql`true`,
    }),

    // 🗑 DELETE : admin 전용
    pgPolicy("places_admin_delete", {
      for: "delete",
      to: adminRole,
      using: sql`true`,
    }),
  ],
);

export const tags = pgTable(
  "tags",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: text().notNull().unique(),
    category: tag_category(),
    description: text(),
    displayOrder: integer().notNull().default(0),
    ...timestamps,
  },
  (t) => [
    // 📖 SELECT : 공개
    pgPolicy("tags_public_select", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),

    // 나머지 동작은 admin 한정
    pgPolicy("tags_admin_insert", {
      for: "insert",
      to: adminRole,
      withCheck: sql`true`,
    }),
    pgPolicy("tags_admin_update", {
      for: "update",
      to: adminRole,
      using: sql`true`,
      withCheck: sql`true`,
    }),
    pgPolicy("tags_admin_delete", {
      for: "delete",
      to: adminRole,
      using: sql`true`,
    }),
  ],
);

export const placeToTags = pgTable(
  "place_to_tags",
  {
    place_id: bigint({ mode: "number" })
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    tag_id: bigint({ mode: "number" })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.place_id, table.tag_id] }),

    // RLS Policies for placeToTags
    // 📖 SELECT : public
    pgPolicy("placeToTags_public_select", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
    // ✏️ INSERT : authenticated users can add tags to their own places
    pgPolicy("placeToTags_auth_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`EXISTS (
        SELECT 1 FROM ${places} 
        WHERE ${places}.id = ${table.place_id} 
        AND ${places}.submitted_by = auth.uid()
      )`,
    }),
    pgPolicy("placeToTags_admin_insert", {
      for: "insert",
      to: adminRole,
      withCheck: sql`true`,
    }),
    // 🗑 DELETE : admin only
    pgPolicy("placeToTags_admin_delete", {
      for: "delete",
      to: adminRole,
      using: sql`true`,
    }),
  ],
);

export const placesRelations = relations(places, ({ many }) => ({
  placesToTags: many(placeToTags),
  placeLikes: many(placeLikes),
  reviews: many(reviews),
  coursePlaces: many(coursePlaces),
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
  (table) => [
    primaryKey({ columns: [table.place_id, table.profile_id] }),

    // RLS Policies for placeLikes
    // 📖 SELECT : public
    pgPolicy("placeLikes_public_select", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
    // ✏️ INSERT : authenticated users for their own likes
    pgPolicy("placeLikes_auth_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`profile_id = auth.uid()`,
    }),
    // 🗑 DELETE : authenticated users for their own likes
    pgPolicy("placeLikes_auth_delete", {
      for: "delete",
      to: authenticatedRole,
      using: sql`profile_id = auth.uid()`,
    }),
  ],
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
  (table) => [
    check("rating_check", sql`${table.rating} BETWEEN 1 AND 5`),

    // RLS Policies for reviews
    // 📖 SELECT : public
    pgPolicy("reviews_public_select", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
    // ✏️ INSERT : authenticated users for their own reviews
    pgPolicy("reviews_auth_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`profile_id = auth.uid() AND place_id IS NOT NULL`,
    }),
    // 🛠 UPDATE : authenticated users for their own reviews
    pgPolicy("reviews_auth_update", {
      for: "update",
      to: authenticatedRole,
      using: sql`profile_id = auth.uid()`,
      withCheck: sql`profile_id = auth.uid() AND place_id IS NOT NULL`,
    }),
    // 🗑 DELETE : authenticated users for their own reviews
    pgPolicy("reviews_auth_delete", {
      for: "delete",
      to: authenticatedRole,
      using: sql`profile_id = auth.uid()`,
    }),
    // 🗑 DELETE : admin can delete any review
    pgPolicy("reviews_admin_delete", {
      for: "delete",
      to: adminRole,
      using: sql`true`,
    }),
  ],
);

export const courses = pgTable(
  "courses",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    name: text("name").notNull(),
    description: text("description"),
    profile_id: uuid("profile_id")
      .notNull()
      .references(() => profiles.profile_id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    // RLS Policies for courses
    // 📖 SELECT : public
    pgPolicy("courses_public_select", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
    // ✏️ INSERT : authenticated users can create their own courses
    pgPolicy("courses_auth_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`profile_id = auth.uid()`,
    }),
    // 🛠 UPDATE : authenticated users can update their own courses
    pgPolicy("courses_auth_update", {
      for: "update",
      to: authenticatedRole,
      using: sql`profile_id = auth.uid()`,
      withCheck: sql`profile_id = auth.uid()`,
    }),
    // 🗑 DELETE : authenticated users can delete their own courses
    pgPolicy("courses_auth_delete", {
      for: "delete",
      to: authenticatedRole,
      using: sql`profile_id = auth.uid()`,
    }),
    // Admin full access
    pgPolicy("courses_admin_all", {
      for: "all",
      to: adminRole,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
);

export const coursePlaces = pgTable(
  "course_places",
  {
    course_id: bigint("course_id", { mode: "number" })
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    place_id: bigint("place_id", { mode: "number" })
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    order: integer("order").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.course_id, table.place_id] }),
    // RLS Policies for course_places
    // 📖 SELECT : public
    pgPolicy("course_places_public_select", {
      for: "select",
      to: "public",
      using: sql`true`,
    }),
    // ✏️ INSERT : authenticated users can add places to their own courses
    pgPolicy("course_places_auth_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`EXISTS (
        SELECT 1 FROM ${courses} 
        WHERE ${courses}.id = ${table.course_id} 
        AND ${courses}.profile_id = auth.uid()
      )`,
    }),
    // 🛠 UPDATE : authenticated users can update places in their own courses
    pgPolicy("course_places_auth_update", {
      for: "update",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM ${courses} 
        WHERE ${courses}.id = ${table.course_id} 
        AND ${courses}.profile_id = auth.uid()
      )`,
      withCheck: sql`EXISTS (
        SELECT 1 FROM ${courses} 
        WHERE ${courses}.id = ${table.course_id} 
        AND ${courses}.profile_id = auth.uid()
      )`,
    }),
    // 🗑 DELETE : authenticated users can delete places from their own courses
    pgPolicy("course_places_auth_delete", {
      for: "delete",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM ${courses} 
        WHERE ${courses}.id = ${table.course_id} 
        AND ${courses}.profile_id = auth.uid()
      )`,
    }),
    // Admin full access
    pgPolicy("course_places_admin_all", {
      for: "all",
      to: adminRole,
      using: sql`true`,
      withCheck: sql`true`,
    }),
  ],
);

// Relations

export const coursesRelations = relations(courses, ({ many, one }) => ({
  coursePlaces: many(coursePlaces),
  profile: one(profiles, {
    fields: [courses.profile_id],
    references: [profiles.profile_id],
  }),
}));

export const coursePlacesRelations = relations(coursePlaces, ({ one }) => ({
  course: one(courses, {
    fields: [coursePlaces.course_id],
    references: [courses.id],
  }),
  place: one(places, {
    fields: [coursePlaces.place_id],
    references: [places.id],
  }),
}));
