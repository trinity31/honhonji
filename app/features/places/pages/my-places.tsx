import type { Route } from "./+types/my-places";
import { redirect } from "react-router";
import makeServerClient from "~/core/lib/supa-client.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [client] = makeServerClient(request);
  
  const { data: { user } } = await client.auth.getUser();
  
  if (!user) {
    throw redirect("/login");
  }

  return { user };
};

export default function MyPlacesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">내 장소</h1>
      <p className="text-gray-600 mt-4">곧 출시 예정입니다.</p>
    </div>
  );
}