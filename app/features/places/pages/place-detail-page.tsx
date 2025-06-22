import type { Route } from "./+types/place-detail-page";

// useRouteLoaderData 임포트 추가
// Removed direct Remix imports, rely on Route types from ./+types/
import { Bookmark, Globe, Home, Instagram, MapPin, Phone } from "lucide-react";
import { useRouteLoaderData, useFetcher } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";

import { getPlaceById } from "../queries";
import { togglePlaceLike } from "~/features/submissions/mutations";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const placeId = Number(params.placeId);
  if (isNaN(placeId)) {
    throw new Response("Invalid Place ID", { status: 400 });
  }

  const [supabase, headers] = makeServerClient(request);
  const { data: { session } } = await supabase.auth.getSession();
  const profileId = session?.user?.id;

  const place = await getPlaceById(request, placeId);

  if (!place) {
    throw new Response("Place Not Found", { status: 404 });
  }

  let isLiked = false;
  if (profileId) {
    const { data: like } = await supabase
      .from("place_likes")
      .select("place_id")
      .eq("place_id", placeId)
      .eq("profile_id", profileId)
      .single();
    isLiked = !!like;
  }

  return { place, isLiked, headers };
};

// MetaFunction은 해당 라우트의 loader 타입을 자동으로 인식합니다.
export const action = async ({ request, params }: Route.ActionArgs) => {
  const placeId = Number(params.placeId);
  if (isNaN(placeId)) {
    throw new Response("Invalid Place ID", { status: 400 });
  }

  const [supabase] = makeServerClient(request);
  const { data: { session } } = await supabase.auth.getSession();
  const profileId = session?.user?.id;

  if (!profileId) {
    throw new Response("User not authenticated", { status: 401 });
  }

  try {
    const result = await togglePlaceLike(request, placeId, profileId);
    return result;
  } catch (error) {
    console.error("Failed to toggle like:", error);
    throw new Response("Failed to update like status", { status: 500 });
  }
};

export const meta: Route.MetaFunction = ({ data }) => {
  const placeName = data?.place?.name || "Place Details";
  return [
    { title: `${placeName} | honhonji` },
    {
      name: "description",
      content: data?.place?.description || "Details for the selected place.",
    },
  ];
};

export default function PlaceDetailPage({ loaderData }: Route.ComponentProps) {
  const { place, isLiked: initialIsLiked } = loaderData;
  const rootLoaderData = useRouteLoaderData("root");
  const kakaoAppKey = rootLoaderData?.env.KAKAO_APP_KEY;

  const fetcher = useFetcher<typeof action>();
  const isLiked = fetcher.data?.liked ?? initialIsLiked;

  if (!place) {
    return (
      <div className="container mx-auto max-w-4xl p-4 text-center md:p-8">
        <h1 className="text-2xl font-bold">Place not found</h1>
        <p>The requested place could not be found.</p>
      </div>
    );
  }

  const staticMapSrc =
    kakaoAppKey && place.lat && place.lng
      ? `https://dapi.kakao.com/v2/staticmap?center=${place.lat},${place.lng}&level=4&marker=p&w=800&h=400&appkey=${kakaoAppKey}`
      : undefined;

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        {place.image_url ? (
          <img
            src={place.image_url}
            alt={place.name}
            className="aspect-video w-full object-cover"
          />
        ) : staticMapSrc ? (
          <img
            src={staticMapSrc}
            alt={`Map of ${place.name}`}
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex aspect-video w-full items-center justify-center bg-gray-100">
            Map preview not available
          </div>
        )}
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-extrabold tracking-tight lg:text-4xl">
              {place.name}
            </CardTitle>
            <fetcher.Form method="post" className="flex items-center">
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="rounded-full"
                disabled={fetcher.state !== "idle"}
              >
                <Bookmark
                  className={cn(
                    "size-7",
                    isLiked
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400",
                  )}
                />
              </Button>
            </fetcher.Form>
          </div>
          <CardDescription className="text-muted-foreground mb-6 text-lg">
            {place.description || "No description available."}
          </CardDescription>

          {place.tags && place.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {place.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-sm">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="text-md text-foreground space-y-4">
            {place.address && (
              <div className="flex items-start gap-4">
                <MapPin className="text-muted-foreground mt-1 h-5 w-5 flex-shrink-0" />
                <span>{place.address}</span>
              </div>
            )}
            {place.phone && (
              <div className="flex items-start gap-4">
                <Phone className="text-muted-foreground mt-1 h-5 w-5 flex-shrink-0" />
                <span>{place.phone}</span>
              </div>
            )}
            {place.homepage && (
              <div className="flex items-start gap-4">
                <Globe className="text-muted-foreground mt-1 h-5 w-5 flex-shrink-0" />
                <a
                  href={place.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-blue-600 hover:underline"
                >
                  {place.homepage}
                </a>
              </div>
            )}
            {place.instagram && (
              <div className="flex items-start gap-4">
                <Instagram className="text-muted-foreground mt-1 h-5 w-5 flex-shrink-0" />
                <a
                  href={
                  place.instagram.startsWith("http")
                    ? place.instagram
                    : `https://instagram.com/${place.instagram.replace(
                        "@",
                        "",
                      )}`
                }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {place.instagram}
                </a>
              </div>
            )}
            {place.naver && (
              <div className="flex items-start gap-4">
                <Home className="text-muted-foreground mt-1 h-5 w-5 flex-shrink-0" />
                <a
                  href={place.naver}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  네이버 플레이스 바로가기
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
