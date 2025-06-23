import type { Route } from "./+types/my-places";

import { Bookmark, Edit, MapPin, Trash2 } from "lucide-react";
import { redirect } from "react-router";
import { useFetcher, useLoaderData, Link } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/core/components/ui/tabs";
import makeServerClient from "~/core/lib/supa-client.server";
import { togglePlaceLike } from "~/features/submissions/mutations";

import { getBookmarkedPlaces } from "../queries";

// 타입 정의
type Place = {
  id: number;
  name: string;
  type: string;
  address: string | null;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  homepage?: string | null;
  instagram?: string | null;
  naver?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  status?: string;
  tags?: { id: number; name: string; category?: string }[];
};

type Course = {
  id: number;
  name: string;
  description?: string;
  places?: Place[];
};

type LoaderData = {
  user: any;
  bookmarkedPlaces: Place[];
  myCourses: Course[];
};

export const action = async ({ request }: Route.ActionArgs) => {
  const [client] = makeServerClient(request);

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const placeId = Number(formData.get("id"));
  const type = formData.get("type");

  if (type === "unbookmark" && placeId) {
    try {
      await togglePlaceLike(request, placeId, user.id);
      return { success: true };
    } catch (error) {
      console.error("Error removing bookmark:", error);
      throw new Response("Failed to remove bookmark", { status: 500 });
    }
  }

  throw new Response("Invalid request", { status: 400 });
};

export const loader = async ({
  request,
}: Route.LoaderArgs): Promise<LoaderData> => {
  const [client] = makeServerClient(request);

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw redirect("/login");
  }

  try {
    // 실제 북마크한 장소들 가져오기
    const bookmarkedPlaces = await getBookmarkedPlaces(request);

    // TODO: 내 코스 데이터 가져오기 구현
    const myCourses: Course[] = [];

    return { user, bookmarkedPlaces, myCourses };
  } catch (error) {
    console.error("Error loading my places data:", error);
    // 에러가 발생해도 빈 배열로 처리
    return { user, bookmarkedPlaces: [], myCourses: [] };
  }
};

export default function MyPlacesPage({ loaderData }: Route.ComponentProps) {
  const { bookmarkedPlaces, myCourses }: LoaderData = useLoaderData();
  const fetcher = useFetcher();

  // 북마크 해제된 장소들을 필터링
  const filteredBookmarkedPlaces = bookmarkedPlaces.filter((place) => {
    // fetcher가 현재 해당 장소를 언북마크 중이면 제외
    if (fetcher.state === "submitting" || fetcher.state === "loading") {
      const formData = fetcher.formData;
      if (
        formData?.get("type") === "unbookmark" &&
        Number(formData.get("id")) === place.id
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">내 장소</h1>
        <p className="text-gray-600">북마크한 장소와 코스를 관리하세요</p>
      </div>

      <Tabs defaultValue="bookmarks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookmarks">
            <Bookmark className="mr-2 h-4 w-4" />
            북마크한 장소 ({filteredBookmarkedPlaces.length})
          </TabsTrigger>
          <TabsTrigger value="courses">
            <MapPin className="mr-2 h-4 w-4" />내 코스 ({myCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookmarks" className="space-y-6">
          {filteredBookmarkedPlaces.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bookmark className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  북마크한 장소가 없습니다
                </h3>
                <p className="mb-4 text-center text-gray-600">
                  마음에 드는 장소를 북마크해보세요
                </p>
                <Button>
                  <MapPin className="mr-2 h-4 w-4" />
                  장소 탐색하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredBookmarkedPlaces.map((place: Place) => (
                <Card
                  key={place.id}
                  className="overflow-hidden py-0 shadow-sm transition-shadow hover:shadow-md"
                >
                  {place.image_url ? (
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gray-100 text-gray-400">
                      <MapPin className="h-8 w-8" />
                    </div>
                  )}
                  <CardHeader className="flex h-48 flex-col justify-between pt-3">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold">
                          {place.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {place.type}
                        </Badge>
                      </div>
                      {place.address && (
                        <p className="mt-4 text-sm text-gray-600">
                          {place.address}
                        </p>
                      )}
                      {place.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-700">
                          {place.description}
                        </p>
                      )}
                    </div>
                    {place.tags && place.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {place.tags.map((tag, index) => (
                          <Badge
                            key={tag.id}
                            className="border-transparent text-xs"
                            style={{
                              backgroundColor: "#FED7AA",
                              color: "#EA580C",
                              border: "1px solid #FDBA74",
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <div className="flex items-center justify-between">
                      <Link to={`/places/${place.id}`}>
                        <Button variant="default" size="sm" className="text-sm">
                          상세보기
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80"
                        onClick={() => {
                          fetcher.submit(
                            {
                              id: place.id,
                              type: "unbookmark",
                            },
                            { method: "post" },
                          );
                        }}
                      >
                        <Bookmark className="size-6 fill-current" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          {myCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  생성된 코스가 없습니다
                </h3>
                <p className="mb-4 text-center text-gray-600">
                  여러 장소를 연결해서 나만의 코스를 만들어보세요
                </p>
                <Button>
                  <MapPin className="mr-2 h-4 w-4" />
                  코스 만들기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myCourses.map((course: Course) => (
                <Card key={course.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2 text-xl">
                          {course.name}
                        </CardTitle>
                        <p className="text-gray-600">{course.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <MapPin className="h-3 w-3" />
                          {course.places?.length || 0}개 장소
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {course.places && course.places.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        {course.places
                          .slice(0, 3)
                          .map((place: Place, index: number) => (
                            <div
                              key={place.id}
                              className="flex items-center gap-3 text-sm"
                            >
                              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                                {index + 1}
                              </div>
                              <span className="text-gray-900">
                                {place.name}
                              </span>
                              <span className="text-gray-500">·</span>
                              <span className="text-gray-600">
                                {place.type}
                              </span>
                            </div>
                          ))}
                        {course.places.length > 3 && (
                          <p className="ml-9 text-sm text-gray-500">
                            외 {course.places.length - 3}개 장소
                          </p>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
