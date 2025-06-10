import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

export const submitPlace = async (
  client: SupabaseClient<Database>,
  {
    type,
    name,
    address,
    tags,
    description,
    userId,
  }: {
    type: "restaurant" | "trail";
    name: string;
    address: string | null;
    tags?: number[];
    description?: string;
    userId?: string;
  },
) => {
  // 1. 장소 생성
  const { data: place, error: placeError } = await client
    .from("places")
    .insert({
      type: type,
      name: name,
      address: address,
      description: description,
      status: "pending",
      source: "user",
      submitted_by: userId,
    })
    .select("*")
    .single();

  if (placeError) {
    console.error('Error creating place:', placeError);
    throw placeError;
  }

  // 2. 태그가 있는 경우 태그 연결
  if (tags && tags.length > 0) {
    const { error: tagError } = await client
      .from("place_to_tags")
      .insert(
        tags.map((tagId) => ({
          place_id: place.id,
          tag_id: tagId,
        }))
      );

    if (tagError) {
      console.error('Error linking tags:', tagError);
      throw tagError;
    }
  }

  return place;
};
