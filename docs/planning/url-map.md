
## 🗺️ 혼혼지 MVP 버전 URL Map

|Page Name|URL Path|Purpose|Access Level|
|---|---|---|---|
|Home|`/`|서비스 소개 및 '혼밥 식당 찾기' 시작|Public|
|Food Map/List|`/foods`|혼밥 식당 지도 및 리스트 보기 (위치 기반, 필터 적용)|Public|
|Food Detail|`/foods/:id`|특정 식당 상세 정보 (혼밥 친화도, 착한 가격, 지도, 후기 등)|Public|
|Submit Food|`/foods/submit`|새로운 식당 제보 폼 (위치, 설명 입력)|Public|
|Write Review|`/foods/:id/review`|특정 식당에 대한 후기 작성 폼|Logged-in Users|
|Login|`/login`|로그인 및 회원가입|Public|
|Dashboard|`/dashboard`|내가 남긴 후기, 제보, 찜한 식당 목록 등|Logged-in Users|
|Admin Panel|`/admin`|식당/후기 제보 관리, 승인 기능|Admin Only|
|Not Found Page|`*`|잘못된 URL 접근 시 404 안내|Public|

---

## 🔁 간단한 흐름 예시

1. `/` → "지금 위치에서 혼밥 식당 보기" 클릭 → `/foods`
    
2. `/foods/:id` → 식당 상세 확인 → 리뷰 확인 or `/foods/:id/review`로 이동
    
3. “이런 곳도 있어요” 버튼 클릭 → `/foods/submit`으로 이동
    
4. 로그인 유도 → `/login`
    
5. 로그인 후 `/dashboard`에서 내 활동 확인 가능
    

---
