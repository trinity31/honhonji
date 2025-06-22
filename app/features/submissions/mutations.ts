import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

import makeServerClient from "~/core/lib/supa-client.server";

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
    tags?: number[];
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
      location:
        latitude && longitude ? `POINT(${longitude} ${latitude})` : undefined,
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
    const tagLinks = tags.map((tagId) => ({
      place_id: place.id,
      tag_id: tagId,
    }));

    const { error: linkTagError } = await client
      .from("place_to_tags")
      .insert(tagLinks);

    if (linkTagError) {
      console.error("Error linking tags to place:", linkTagError);
      // 장소는 생성되었으나 태그 연결 실패. 처리 정책 필요.
      throw linkTagError;
    }
  }

  return place;
};

export const togglePlaceLike = async (
  request: Request,
  placeId: number,
  profileId: string,
) => {
  const [supabase] = makeServerClient(request);

  // First, check if the like exists
  const { data: existingLike, error: selectError } = await supabase
    .from("place_likes")
    .select("*")
    .eq("place_id", placeId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (selectError) {
    console.error("Error checking for like:", selectError);
    throw selectError;
  }

  if (existingLike) {
    // If it exists, delete it
    const { error: deleteError } = await supabase
      .from("place_likes")
      .delete()
      .eq("place_id", placeId)
      .eq("profile_id", profileId);

    if (deleteError) {
      console.error("Error unliking place:", deleteError);
      throw deleteError;
    }
    return { liked: false };
  } else {
    // If it does not exist, insert it
    const { error: insertError } = await supabase.from("place_likes").insert({
      place_id: placeId,
      profile_id: profileId,
    });

    if (insertError) {
      console.error("Error liking place:", insertError);
      throw insertError;
    }
    return { liked: true };
  }
};
