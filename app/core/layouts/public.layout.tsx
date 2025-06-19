import type { Route } from "./+types/public.layout";

import { Outlet, redirect } from "react-router";

import makeServerClient from "../lib/supa-client.server";

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();
  
  // 현재 URL 가져오기
  const url = new URL(request.url);
  const path = url.pathname;
  
  // /map과 /places/submission 경로는 리다이렉트하지 않음
    if (user && path !== "/map" && !path.startsWith("/places/")) {
    throw redirect("/dashboard");
  }

  // Return an empty object to avoid the "Cannot read properties of undefined" error
  return {};
}

export default function PublicLayout() {
  return <Outlet />;
}
