import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

// PlaceType 임포트

export const submitPlace = async (
  client: SupabaseClient<Database>,
  {
    placeType,
    placeName,
    address,
    detailAddress,
    tags,
    content,
    userId,
    latitude,
    longitude,
    image_url,
    phone,
    homepage,
    instagram,
    naver,
  }: {
    placeType: Database["public"]["Enums"]["place_types"];
    placeName: string;
    address?: string | null;
    detailAddress?: string | null;
    tags?: string[];
    content?: string | null;
    userId?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    image_url?: string | null;
    phone?: string | null;
    homepage?: string | null;
    instagram?: string | null;
    naver?: string | null;
  },
) => {
  // 1. 장소 생성
  const { data: place, error: placeError } = await client
    .from("places")
    .insert({
      type: placeType,
      name: placeName,
      address: address || undefined,
      description: content || undefined,
      submitted_by: userId || undefined,
      source: userId ? "user" : "admin",
      status: "pending",
      lat: latitude,
      lng: longitude,
      image_url: image_url,
      phone: phone,
      homepage: homepage,
      instagram: instagram,
      naver: naver,
    })
    .select("id, name") // id만 가져와도 충분, 필요시 name도
    .single();

  if (placeError) {
    console.error("Error creating place:", placeError);
    throw placeError;
  }

  if (!place || !place.id) {
    console.error("Failed to create place or retrieve place ID");
    throw new Error("Failed to create place or retrieve place ID");
  }

  // 2. 태그가 있는 경우 태그 연결
  if (tags && tags.length > 0) {
    // 문자열 태그 이름/값을 ID로 변환
    const { data: existingTags, error: fetchTagsError } = await client
      .from("tags")
      .select("id, name")
      .in("name", tags); // 또는 'value' 필드를 사용한다면 .in("value", tags)

    if (fetchTagsError) {
      console.error("Error fetching tag IDs:", fetchTagsError);
      // 태그 조회 실패 시 장소 생성은 성공했으므로 place 객체를 반환하거나, 부분적 성공으로 처리
      // 여기서는 오류를 던져서 전체 트랜잭션이 롤백되도록 할 수 있음 (Supabase 함수 내에서 트랜잭션 관리 필요)
      throw fetchTagsError;
    }

    if (existingTags && existingTags.length > 0) {
      const tagLinks = existingTags.map((tag) => ({
        place_id: place.id,
        tag_id: tag.id, // 숫자 ID 사용
      }));

      const { error: linkTagError } = await client
        .from("place_to_tags")
        .insert(tagLinks);

      if (linkTagError) {
        console.error("Error linking tags to place:", linkTagError);
        // 장소는 생성되었으나 태그 연결 실패. 처리 정책 필요.
        throw linkTagError;
      }
    } else {
      console.warn("No matching tags found in DB for names:", tags);
    }
  }

  return place;
};
