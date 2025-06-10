-- 인증된 사용자가 자신이 제출한 장소에 태그를 추가할 수 있는 정책
CREATE POLICY "placeToTags_auth_insert" 
ON "public"."place_to_tags" 
AS PERMISSIVE 
FOR INSERT 
TO "authenticated" 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."places" 
    WHERE "places".id = "place_to_tags"."place_id" 
    AND "places".submitted_by = auth.uid()
  )
);

-- 관리자가 모든 장소에 태그를 추가할 수 있는 정책 (이미 존재하면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE p.polname = 'placeToTags_admin_insert'
    AND c.relname = 'place_to_tags'
  ) THEN
    CREATE POLICY "placeToTags_admin_insert" 
    ON "public"."place_to_tags" 
    AS PERMISSIVE 
    FOR INSERT 
    TO "admin" 
    WITH CHECK (true);
  END IF;
END $$;