import type { Database } from "database.types";

import makeServerClient from "~/core/lib/supa-client.server";

export const getRestaurants = async (request: Request) => {
  const [client] = makeServerClient(request);
  const { data, error } = await client
    .from("places")
    .select("*")
    .eq("type", "restaurant");
  if (error) throw error;

  return data;
};
