import type { Database } from "database.types";

import makeServerClient from "~/core/lib/supa-client.server";

export const getRestaurants = async (request: Request) => {
  const [client] = makeServerClient(request);

  // 식당 데이터와 태그 정보를 함께 가져오기
  const { data: places, error: placesError } = await client
    .from("places")
    .select("*")
    .eq("type", "restaurant")
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
