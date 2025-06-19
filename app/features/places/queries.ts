import type { Database } from "database.types";

import makeServerClient from "~/core/lib/supa-client.server";

import { PLACE_TYPES } from "./constants";

export const getRestaurants = async (request: Request) => {
  const [client] = makeServerClient(request);

  // 식당 데이터와 태그 정보를 함께 가져오기
  const { data: places, error: placesError } = await client
    .from("places")
    .select("*")
    .in("type", ["restaurant", "cafe"])
    .eq("status", "approved");
  if (placesError) throw placesError;

  // 식당-태그 관계 가져오기
  const { data: placeTags, error: placeTagsError } = await client
    .from("place_to_tags")
    .select("place_id, tag_id, tags(id, name)");
  if (placeTagsError) throw placeTagsError;

  // 각 식당에 태그 정보 추가
  const restaurantsWithTags = places.map((place) => {
    const tags = placeTags
      .filter((pt) => pt.place_id === place.id)
      .map((pt) => pt.tags)
      .filter((tag) => tag !== null);

    return {
      ...place,
      tags: tags.length > 0 ? tags : [],
    };
  });

  return restaurantsWithTags;
};

export const getAllTags = async (request: Request) => {
  const [client] = makeServerClient(request);
  const { data, error } = await client.from("tags").select("*");
  if (error) throw error;

  return data;
};

export const getOtherPlaces = async (request: Request) => {
  const [client] = makeServerClient(request);

  // 'restaurant'와 'cafe'를 제외한 장소 타입들을 가져옵니다.
  const otherPlaceTypeValues = PLACE_TYPES.map((pt) => pt.value).filter(
    (value) => value !== "restaurant" && value !== "cafe",
  );

  if (otherPlaceTypeValues.length === 0) {
    return [];
  }

  // 다른 타입의 장소 데이터와 태그 정보를 함께 가져오기
  const { data: places, error: placesError } = await client
    .from("places")
    .select("*")
    .in("type", otherPlaceTypeValues)
    .eq("status", "approved");

  if (placesError) throw placesError;
  if (!places) return [];

  // 장소-태그 관계 가져오기
  const placeIds = places.map((p) => p.id);
  if (placeIds.length === 0) {
    return places.map((place) => ({ ...place, tags: [] }));
  }

  const { data: placeTags, error: placeTagsError } = await client
    .from("place_to_tags")
    .select("place_id, tag_id, tags(id, name)")
    .in("place_id", placeIds);

  if (placeTagsError) throw placeTagsError;

  // 각 장소에 태그 정보 추가
  const placesWithTags = places.map((place) => {
    const tags = placeTags
      ? placeTags
          .filter((pt) => pt.place_id === place.id)
          .map((pt) => pt.tags)
          .filter((tag): tag is NonNullable<typeof tag> => tag !== null)
      : [];

    return {
      ...place,
      tags: tags.length > 0 ? tags : [],
    };
  });

  return placesWithTags;
};

export const getPlaceById = async (request: Request, placeId: number) => {
  const [client] = makeServerClient(request);

  // 장소 정보 가져오기
  const { data: place, error: placeError } = await client
    .from("places")
    .select("*")
    .eq("id", placeId)
    .single();

  if (placeError) {
    console.error("Error fetching place:", placeError);
    return null; // 또는 오류를 throw
  }
  if (!place) return null;

  // 해당 장소의 태그 정보 가져오기
  const { data: placeTags, error: placeTagsError } = await client
    .from("place_to_tags")
    .select(`
      tags (id, name, category, description)
    `)
    .eq("place_id", placeId);

  if (placeTagsError) {
    console.error("Error fetching place tags:", placeTagsError);
    // 태그를 가져오지 못해도 장소 정보는 반환할 수 있도록 처리
  }

  const tags = placeTags?.map(pt => pt.tags).filter(Boolean) || [];

  return { ...place, tags };
};
