import {
  bigint,
  doublePrecision,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { PLACE_TYPES } from "./constants";

export const placeTypes = pgEnum(
  "place_types",
  PLACE_TYPES.map((type) => type.value) as [string, ...string[]],
);

export const placeSources = pgEnum("place_sources", ["user", "admin"]);

export const places = pgTable("places", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  type: placeTypes().notNull(),
  description: text(),
  address: text().notNull(),
  lat: doublePrecision().notNull(),
  lng: doublePrecision().notNull(),
  roadAddress: text(),
  phone: text(),
  homepage: text(),
  instagram: text(),
  naver: text(),
  source: placeSources().notNull().default("admin"),
  image_url: text(),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
