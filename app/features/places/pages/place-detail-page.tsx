import type { Route } from "./+types/place-detail-page";

// useRouteLoaderData 임포트 추가
// Removed direct Remix imports, rely on Route types from ./+types/
import { Globe, Home, Instagram, MapPin, Phone } from "lucide-react";
import { useRouteLoaderData } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";

import { getPlaceById } from "../queries";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const placeId = Number(params.placeId);
  if (isNaN(placeId)) {
    throw new Response("Invalid Place ID", { status: 400 });
  }

  const place = await getPlaceById(request, placeId);

  if (!place) {
    throw new Response("Place Not Found", { status: 404 });
  }
  // kakaoAppKey는 컴포넌트에서 root loader data를 통해 가져옵니다.
  return { place };
};

// MetaFunction은 해당 라우트의 loader 타입을 자동으로 인식합니다.
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
  const { place } = loaderData;
  // KAKAO_APP_KEY는 root loader data에서 가져옵니다.
  const rootData = useRouteLoaderData("root") as {
    env?: { KAKAO_APP_KEY?: string };
  }; // 타입 단언 추가
  const kakaoAppKey = rootData?.env?.KAKAO_APP_KEY;

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
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="p-0">
          <div className="flex aspect-video items-center justify-center bg-gray-100">
            {place.image_url ? (
              <img
                src={place.image_url}
                alt={place.name}
                className="h-full w-full object-cover"
              />
            ) : staticMapSrc ? (
              <img
                src={staticMapSrc}
                alt={`Map of ${place.name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground">
                Map preview not available
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <CardTitle className="mb-2 text-3xl font-extrabold tracking-tight lg:text-4xl">
            {place.name}
          </CardTitle>
          <CardDescription className="text-muted-foreground mb-6 text-lg">
            {place.description || "No description available."}
          </CardDescription>

          {place.tags && place.tags.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {/* Removed ': any' from tag, relying on type inference from loader data */}
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
                  href={`https://instagram.com/${place.instagram.replace(
                    "@",
                    "",
                  )}`}
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
