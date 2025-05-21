혼혼지(Honhonji) MVP에 맞춘 **데이터 모델링 초안**을 아래와 같이 설계했습니다. 사용자의 식당 탐색, 후기 작성, 제보 기능에 초점을 맞췄습니다.

---

# 🧱 Data Model Planning Worksheet — **혼혼지 (MVP)**

## 1. 시스템의 핵심 엔터티 (Entities)

* `Profile`
* `Place`
* `Review`
* `Submission` (제보)
* `Favorite` (찜한 식당)

---

## 2. 각 엔터티의 필드 정의

---

### **Profile**

* `id` (UUID)
* `email` (string, unique)
* `name` (string, optional)
* `role` (enum: user, admin)
* `created_at` (timestamp)
* `updated_at` (timestamp)

---

### **Place**

* `id` (UUID)
* `type` (enum: restaurant, walk, etc)
* `name` (string)
* `address` (string)
* `lat` (float)
* `lng` (float)
* `category` (string) — 예: 한식, 돈까스, 일식 등
* `price_level` (enum: cheap, moderate, expensive) — 착한 가격 태그 기반
* `honbab_score` (int, 0\~100) — 혼밥 친화도 점수
* `image_url` (string, optional)
* `source` (enum: admin, user\_submission)
* `created_at` (timestamp)
* `updated_at` (timestamp)

---

### **Review**

* `id` (UUID)
* `user_id` (foreign key → User)
* `place_id` (foreign key → Place)
* `rating` (int, 1\~5)
* `text` (text)
* `created_at` (timestamp)

---

### **Submission** (사용자 제보)

* `id` (UUID)
* `user_id` (nullable → 익명 제보 허용)
* `place_type` (enum: restaurant, walk, etc)
* `place_name` (string)
* `address` (string)
* `lat` (float, optional)
* `lng` (float, optional)
* `notes` (text)ㅌ
* `status` (enum: pending, approved, rejected)
* `created_at` (timestamp)

---

### **Favorite**

* `id` (UUID)
* `user_id` (foreign key → User)
* `place_id` (foreign key → Place)
* `created_at` (timestamp)


### **Tag**

* `id` (UUID)
* `key` (string)
* `label` (string)
* `description` (string)
* `type` (enum: restaurant, walk, etc)
* `is_active` (boolean)
* `created_at` (timestamp)

### **PlaceTag**

* `id` (UUID)
* `place_id` (foreign key → Place)
* `tag_id` (foreign key → Tag)


---

## 3. 관계 정리

* **1 User → many Review**
* **1 Place → many Review**
* **1 User → many Submission**
* **1 Place ← many Submission** (간접적으로 전환될 수 있음)
* **1 User → many Favorite**

---

## 4. CRUD 작업

| Entity     | Create               | Read       | Update         | Delete    |
| ---------- | -------------------- | ---------- | -------------- | --------- |
| User       | ✅                    | ✅ (Self)   | ✅ (Self/Admin) | ✅ (Self)  |
| Place      | ✅ (Admin/Submission) | ✅ (Public) | ✅ (Admin)      | ✅ (Admin) |
| Review     | ✅                    | ✅ (Public) | ✅ (Owner)      | ✅ (Owner) |
| Submission | ✅                    | ✅ (Admin)  | ✅ (Admin)      | ✅ (Admin) |
| Favorite   | ✅                    | ✅ (Self)   | ❌              | ✅ (Self)  |

---

## 5. 규칙 및 제약

* ✅ **리뷰는 유저당 한 식당에 1개만 작성 가능**, 수정 가능
* ✅ **익명 제보 가능**, 단 `user_id`가 없으면 spam 필터링 필요
* ✅ **Submission**의 상태가 `approved`일 때만 Place로 전환
* ✅ **Admin만** `/admin` 경로 접근 가능
* ✅ **Place 생성 시** 주소 + lat/lng 중복 검증 필요
* ✅ **Soft Delete** 정책 미도입 (현재 MVP에서는 즉시 삭제 가능)
* ✅ **UNIQUE (place_id, tag_id)**

---

## 💡 참고

이 스키마는 **Supabase**에 최적화된 구조로 설계되었으며,
필요 시 `Storage`를 사용한 이미지 업로드 및 `RLS` 정책도 쉽게 연계할 수 있습니다.

---

다음 단계:

* Supabase 테이블 생성 SQL
* RLS(Row Level Security) 정책 예시
* 마이페이지용 쿼리 예시 (`내가 남긴 리뷰`, `내가 찜한 식당` 등)

