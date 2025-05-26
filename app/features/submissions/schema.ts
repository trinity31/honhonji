import { relations } from "drizzle-orm";
import {
  bigint,
  boolean,
  doublePrecision,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { placeTypes } from "~/features/places/schema";
import { tags } from "~/features/tags/schema";

/**
 * Submission status enum
 * - pending: Submission is under review
 * - approved: Submission has been approved and processed
 * - rejected: Submission has been rejected
 */
export const submissionStatus = pgEnum("submission_status", [
  "pending",
  "approved",
  "rejected",
]);

/**
 * Submission type enum
 * - new: New place submission
 * - update: Update for existing place
 * - removal: Request to remove a place
 */
export const submissionType = pgEnum("submission_type", [
  "new",
  "update",
  "removal",
]);

/**
 * Place Submissions Table
 * Stores user-submitted place information
 */
export const submissions = pgTable("submissions", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  type: submissionType().notNull(),
  status: submissionStatus().notNull().default("pending"),
  place_id: bigint({ mode: "number" }),

  user_id: uuid("user_id"),
  is_anonymous: boolean().notNull().default(false),

  name: text("name"),
  place_type: placeTypes().notNull(),
  description: text("description"),

  address: text("address").notNull().default(""),
  roadAddress: text("road_address"),
  lat: doublePrecision("latitude"),
  lng: doublePrecision("longitude"),

  phone: text("phone"),
  homepage: text("homepage"),
  instagram: text("instagram"),
  naver: text("naver"),

  // Additional metadata
  source: text("source").default("user"),
  image_url: text(),
  tag_ids: bigint({ mode: "number" }).array().default([]),

  adminNotes: text("admin_notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

/**
 * Submission Tags Table
 * Stores tags associated with submissions (for new/update submissions)
 */
export const submissionTags = pgTable("submission_tags", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  submission_id: bigint({ mode: "number" }).notNull(),
  tag_id: bigint({ mode: "number" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const submissionsRelations = relations(submissions, ({ many }) => ({
  tags: many(submissionTags),
}));

export const submissionTagsRelations = relations(submissionTags, ({ one }) => ({
  submission: one(submissions, {
    fields: [submissionTags.submission_id],
    references: [submissions.id],
  }),
  tag: one(tags, {
    fields: [submissionTags.tag_id],
    references: [tags.id],
  }),
}));
