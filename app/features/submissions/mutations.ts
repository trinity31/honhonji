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
  }: {
    type: "restaurant" | "trail";
    name: string;
    address: string;
    tags?: string;
    description?: string;
  },
) => {
  const { data, error } = await client
    .from("places")
    .insert({
      type: type,
      name: name,
      address: address,
      tags: tags,
      description: description,
    })
    .select("*")
    .single();
  if (error) {
    throw error;
  }
  return data;
};
