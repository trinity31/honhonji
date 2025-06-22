-- 1. places 테이블에 geography(Point, 4326) 타입의 'location' 컬럼을 추가합니다.
--    SRID 4326은 GPS에서 사용하는 표준 좌표 체계(WGS 84)입니다.
ALTER TABLE public.places
ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- 2. 기존에 저장된 lat, lng 데이터를 사용하여 'location' 컬럼을 채웁니다.
--    ST_MakePoint 함수는 (경도, 위도) 순서로 인자를 받습니다.
UPDATE public.places
SET location = ST_MakePoint(lng, lat)::geography
WHERE lng IS NOT NULL AND lat IS NOT NULL;

-- 3. 성능 향상을 위해 'location' 컬럼에 공간 인덱스(spatial index)를 생성합니다.
--    이 인덱스가 없으면 위치 기반 검색이 매우 느려집니다.
CREATE INDEX IF NOT EXISTS places_location_idx
ON public.places
USING GIST (location);
