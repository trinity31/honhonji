-- 이 함수는 검색할 위도, 경도, 반경(미터)을 인자로 받아,
-- 'places' 테이블에서 승인된(approved) 장소들을 검색 중심점으로부터 가까운 순서대로 반환합니다.

-- 사전 요구사항:
-- 1. `places` 테이블에 `location GEOGRAPHY(Point, 4326)` 타입의 컬럼이 존재해야 합니다. (완료)
-- 2. `location` 컬럼에 GIST 인덱스가 생성되어 있어야 성능이 보장됩니다. (완료)
-- 3. PostGIS 확장이 활성화되어 있어야 합니다. (완료)

CREATE OR REPLACE FUNCTION public.places_near_location(
    search_lat double precision,
    search_lng double precision,
    search_radius_meters integer
)
RETURNS SETOF public.places AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.places
  WHERE
    -- ST_DWithin 함수를 사용해 검색 반경 내에 있는 장소만 필터링합니다.
    -- location 컬럼(geography 타입)과 검색 중심점 사이의 거리를 계산합니다.
    ST_DWithin(
      location,
      ST_MakePoint(search_lng, search_lat)::geography, -- 검색 중심점 (경도, 위도 순서)
      search_radius_meters
    )
    AND
    -- 'approved' 상태인 장소만 결과에 포함시킵니다.
    status = 'approved'
  ORDER BY
    -- ST_Distance 함수를 사용해 검색 중심점으로부터의 거리를 기준으로 오름차순 정렬합니다.
    ST_Distance(
      location,
      ST_MakePoint(search_lng, search_lat)::geography
    );
END;
$$ LANGUAGE plpgsql STABLE;
-- STABLE 키워드는 함수가 데이터베이스를 수정하지 않고,
-- 동일한 인자에 대해 항상 동일한 결과를 반환함을 명시하여 최적화에 도움을 줍니다.