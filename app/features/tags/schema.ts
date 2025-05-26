import { relations } from "drizzle-orm";
import {
  bigint,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { places } from "~/features/places/schema";

/**
 * 태그 카테고리
 * 태그를 그룹화하기 위한 카테고리 (예: '편의시설', '분위기' 등)
 */
export const tagCategory = pgEnum("tag_category", [
  "facility", // 편의시설 (콘센트, 와이파이 등)
  "atmosphere", // 분위기 (조용한, 아늑한 등)
  "price", // 가격 (가성비, 고급진 등)
  "meal_category", // 식사 종류 (한식, 일식, 양식 등)
  "meal_type", // 식사 타입 (다이어트, 비건 등)
  "meal_time", // 식사 시간 (아침식사, 야식 등)
  "etc",
]);

/**
 * 태그 테이블
 * 재사용 가능한 태그들을 저장
 */
export const tags = pgTable("tags", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
  category: tagCategory(),
  description: text(),
  displayOrder: integer().notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * 장소-태그 중간 테이블
 * 다대다 관계를 위한 테이블
 */
export const placeTags = pgTable("place_tags", {
  id: uuid().primaryKey().defaultRandom(),
  place_id: bigint({ mode: "number" }).notNull(),
  tag_id: bigint({ mode: "number" }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 관계 정의
export const tagsRelations = relations(tags, ({ many }) => ({
  placeTags: many(placeTags),
}));

export const placeTagsRelations = relations(placeTags, ({ one }) => ({
  place: one(places, {
    fields: [placeTags.place_id],
    references: [places.id],
  }),
  tag: one(tags, {
    fields: [placeTags.tag_id],
    references: [tags.id],
  }),
}));
