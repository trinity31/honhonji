-- CREATE TYPE "public"."tag_category" AS ENUM('facility', 'atmosphere', 'price', 'meal_category', 'meal_type', 'meal_time', 'etc');--> statement-breakpoint
ALTER TABLE "tag_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "tag_categories" CASCADE;--> statement-breakpoint
-- ALTER TABLE "tags" DROP CONSTRAINT "tags_category_id_tag_categories_category_id_fk";
--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "category" "tag_category";--> statement-breakpoint
ALTER TABLE "tags" DROP COLUMN "category_id";--> statement-breakpoint

-- 태그 항목 삽입
INSERT INTO "tags" ("name", "category", "description", "displayOrder") VALUES
('가성비', 'price', '가격 대비 만족도가 높은 곳', 10),
('1인석', 'facility', '혼자 방문하기 좋은 1인석이 있는 곳', 20),
('콘센트', 'facility', '콘센트가 있어 노트북 사용이 편리한 곳', 30),
('아침식사', 'meal_time', '아침 식사를 제공하는 곳', 40),
('심야영업', 'meal_time', '늦은 시간까지 영업하는 곳', 50),
('다이어트', 'meal_type', '다이어트에 적합한 메뉴가 있는 곳', 60),
('비건', 'meal_type', '비건 메뉴를 제공하는 곳', 70);