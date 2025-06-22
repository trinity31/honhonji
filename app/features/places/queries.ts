import type { Database } from "database.types";

import makeServerClient from "~/core/lib/supa-client.server";

import { PLACE_TYPES } from "./constants";

export const getRestaurants = async (
  request: Request,
  lat?: number,
  lng?: number,
) => {
  const [client] = makeServerClient(request);

  let query;

  // 위도와 경도 값이 모두 제공되면 RPC를 호출합니다.
  if (lat && lng) {
    query = client.rpc("places_near_location", {
      search_lat: lat,
      search_lng: lng,
      search_radius_meters: 3000, //
    });
  } else {
    // 위치 정보가 없으면 기존 방식으로 모든 식당/카페를 가져옵니다.
    query = client
      .from("places")
      .select("*")
      .in("type", ["restaurant", "cafe"])
      .eq("status", "approved")
      .order("created_at", { ascending: false });
  }

  // 조건에 맞는 식당 데이터 가져오기
  const { data: places, error: placesError } = await query;
  if (placesError) throw placesError;
  if (!places) return [];

  // 식당-태그 관계 가져오기
  const placeIds = places.map((p) => p.id);
  const { data: placeTags, error: placeTagsError } = await client
    .from("place_to_tags")
    .select("place_id, tags(id, name)")
    .in("place_id", placeIds);
  if (placeTagsError) throw placeTagsError;

  // 각 식당에 태그 정보 추가 (효율적인 방법을 사용)
  const tagsByPlaceId = new Map<number, any[]>();
  if (placeTags) {
    for (const pt of placeTags) {
      if (pt.place_id === null) continue;
      if (!tagsByPlaceId.has(pt.place_id)) {
        tagsByPlaceId.set(pt.place_id, []);
      }
      if (pt.tags) {
        tagsByPlaceId.get(pt.place_id)?.push(pt.tags);
      }
    }
  }

  const restaurantsWithTags = places.map((place) => {
    return {
      ...place,
      tags: tagsByPlaceId.get(place.id) || [],
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

export const getOtherPlaces = async (
  request: Request,
  lat?: number,
  lng?: number,
) => {
  const [client] = makeServerClient(request);

  let query;

  // 'restaurant'와 'cafe'를 제외한 장소 타입들을 가져옵니다.
  const otherPlaceTypeValues = PLACE_TYPES.map((pt) => pt.value).filter(
    (value) => value !== "restaurant" && value !== "cafe",
  );

  if (otherPlaceTypeValues.length === 0) {
    return [];
  }

  if (lat && lng) {
    query = client.rpc("places_near_location", {
      search_lat: lat,
      search_lng: lng,
      search_radius_meters: 3000,
    });
  } else {
    query = client
      .from("places")
      .select("*")
      .in("type", otherPlaceTypeValues)
      .eq("status", "approved");
  }

  const { data: places, error: placesError } = await query;

  if (placesError) throw placesError;
  if (!places) return [];

  // rpc 결과는 모든 타입을 포함하므로 필터링이 필요
  const filteredPlaces = places.filter((place) =>
    otherPlaceTypeValues.includes(place.type as any),
  );

  // 장소-태그 관계 가져오기
  const placeIds = filteredPlaces.map((p) => p.id);
  if (placeIds.length === 0) {
    return filteredPlaces.map((place) => ({ ...place, tags: [] }));
  }

  const { data: placeTags, error: placeTagsError } = await client
    .from("place_to_tags")
    .select("place_id, tags(id, name)")
    .in("place_id", placeIds);

  if (placeTagsError) throw placeTagsError;

  // 각 장소에 태그 정보 추가
  const tagsByPlaceId = new Map<number, any[]>();
  if (placeTags) {
    for (const pt of placeTags) {
      if (pt.place_id === null) continue;
      if (!tagsByPlaceId.has(pt.place_id)) {
        tagsByPlaceId.set(pt.place_id, []);
      }
      if (pt.tags) {
        tagsByPlaceId.get(pt.place_id)?.push(pt.tags);
      }
    }
  }

  const placesWithTags = filteredPlaces.map((place) => {
    return {
      ...place,
      tags: tagsByPlaceId.get(place.id) || [],
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
    .select(
      `
      tags (id, name, category, description)
    `,
    )
    .eq("place_id", placeId);

  if (placeTagsError) {
    console.error("Error fetching place tags:", placeTagsError);
    // 태그를 가져오지 못해도 장소 정보는 반환할 수 있도록 처리
  }

  const tags = placeTags?.map((pt) => pt.tags).filter(Boolean) || [];

  return { ...place, tags };
};
