import makeServerClient from "~/core/lib/supa-client.server";

export const getPendingPlaces = async (request: Request) => {
  const [client] = makeServerClient(request);
  const { data, error } = await client.from("places").select("*").eq("status", "pending");
  if (error) throw error;

  return data;
};
