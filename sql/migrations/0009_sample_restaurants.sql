-- 샘플 식당 데이터 3개 추가
INSERT INTO "places" (
  "name", 
  "type", 
  "status", 
  "description", 
  "lat", 
  "lng", 
  "source", 
  "image_url", 
  "stats"
) VALUES 
(
  '행복밥상', 
  'restaurant', 
  'approved', 
  '아침식사가 제공되는 가성비 좋고 푸짐한 식당', 
  37.475886, 
  127.043201, 
  'admin', 
  '/images/res1.png',
  '{"views": 0, "reviews": 0, "likes": 0}'
),
(
  '슬로우캘리 양재포이점', 
  'restaurant', 
  'approved', 
  '신선한 재료로 만든 건강한 한끼, 비건 메뉴 제공', 
  37.47622, 
  127.043966, 
  'admin', 
  '/images/res2.jpeg',
  '{"views": 0, "reviews": 0, "likes": 0}'
),
(
  '버거베어 프리다이너', 
  'restaurant', 
  'approved', 
  '5성급 호텔 셰프님이 만드는 육즙 폭발 퀄리티&가성비 수제버거 맛집', 
  37.476268, 
  127.039455, 
  'admin', 
  '/images/res3.jpeg',
  '{"views": 0, "reviews": 0, "likes": 0}'
);

-- 식당과 태그 연결
-- 행복밥상: 아침식사, 가성비 태그 연결
INSERT INTO "place_to_tags" ("place_id", "tag_id")
SELECT 
  p.id, 
  t.id
FROM 
  "places" p, 
  "tags" t
WHERE 
  p.name = '행복밥상' AND 
  t.name IN ('아침식사', '가성비');

-- 슬로우캘리 양재포이점: 비건 태그 연결
INSERT INTO "place_to_tags" ("place_id", "tag_id")
SELECT 
  p.id, 
  t.id
FROM 
  "places" p, 
  "tags" t
WHERE 
  p.name = '슬로우캘리 양재포이점' AND 
  t.name IN ('비건');

-- 버거베어 프리다이너: 가성비 태그 연결
INSERT INTO "place_to_tags" ("place_id", "tag_id")
SELECT 
  p.id, 
  t.id
FROM 
  "places" p, 
  "tags" t
WHERE 
  p.name = '버거베어 프리다이너' AND 
  t.name IN ('가성비');
