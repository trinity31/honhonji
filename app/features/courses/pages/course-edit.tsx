import type { Identifier } from "dnd-core";

import type { Route } from "./+types/course-edit";

import {
  ArrowLeft,
  Check,
  GripVertical,
  MapPin,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { redirect } from "react-router";
import { Link, useFetcher, useLoaderData } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import { Input } from "~/core/components/ui/input";
import { Toaster, toast } from "~/core/components/ui/sonner";
import { Textarea } from "~/core/components/ui/textarea";
import makeServerClient from "~/core/lib/supa-client.server";

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
  description: string | null;
  places: Place[];
};

type LoaderData = {
  course: Course;
  availablePlaces: Place[];
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const [client] = makeServerClient(request);

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    throw redirect("/login");
  }

  const courseId = Number(params.courseId);

  // 코스 정보 가져오기
  const { data: course, error: courseError } = await client
    .from("courses")
    .select(
      `
      id,
      name,
      description,
      course_places(
        place_id,
        order,
        places(
          id,
          name,
          type,
          address,
          description,
          lat,
          lng,
          phone,
          homepage,
          instagram,
          naver,
          image_url,
          created_at,
          updated_at,
          status
        )
      )
    `,
    )
    .eq("id", courseId)
    .eq("profile_id", user.id)
    .single();

  if (courseError || !course) {
    throw new Response("코스를 찾을 수 없습니다", { status: 404 });
  }

  // 코스에 포함된 장소들을 정렬하여 구성
  const coursePlaces =
    course.course_places
      ?.sort((a, b) => a.order - b.order)
      ?.map((cp) => cp.places)
      ?.filter(Boolean) || [];

  // 사용 가능한 모든 장소 가져오기 (현재 코스에 포함되지 않은 장소들)
  const currentPlaceIds = coursePlaces.map((p) => p.id);
  const { data: availablePlaces, error: placesError } = await client
    .from("places")
    .select("*")
    .eq("status", "approved")
    .not("id", "in", `(${currentPlaceIds.join(",") || "0"})`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (placesError) {
    console.error("Error fetching available places:", placesError);
  }

  return {
    course: {
      id: course.id,
      name: course.name,
      description: course.description,
      places: coursePlaces,
    },
    availablePlaces: availablePlaces || [],
  };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const [client] = makeServerClient(request);

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const courseId = Number(params.courseId);
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  try {
    if (actionType === "updateCourse") {
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;

      const { error } = await client
        .from("courses")
        .update({
          name,
          description: description || null,
        })
        .eq("id", courseId)
        .eq("profile_id", user.id);

      if (error) throw error;

      return Response.json({
        success: true,
        message: "코스가 성공적으로 저장되었습니다.",
      });
    } else if (actionType === "addPlace") {
      const placeId = Number(formData.get("placeId"));

      // 현재 코스의 최대 order 가져오기
      const { data: maxOrder } = await client
        .from("course_places")
        .select("order")
        .eq("course_id", courseId)
        .order("order", { ascending: false })
        .limit(1);

      const nextOrder = (maxOrder?.[0]?.order || 0) + 1;

      const { error } = await client.from("course_places").insert({
        course_id: courseId,
        place_id: placeId,
        order: nextOrder,
      });

      if (error) throw error;
    } else if (actionType === "removePlace") {
      const placeId = Number(formData.get("placeId"));

      const { error } = await client
        .from("course_places")
        .delete()
        .eq("course_id", courseId)
        .eq("place_id", placeId);

      if (error) throw error;
    } else if (actionType === "reorderPlaces") {
      const placeIds = JSON.parse(formData.get("placeIds") as string);

      // 순서대로 업데이트
      for (let i = 0; i < placeIds.length; i++) {
        await client
          .from("course_places")
          .update({ order: i + 1 })
          .eq("course_id", courseId)
          .eq("place_id", placeIds[i]);
      }
    } else if (actionType === "deleteCourse") {
      // 먼저 코스에 연결된 장소들 삭제
      await client
        .from("course_places")
        .delete()
        .eq("course_id", courseId);

      // 코스 삭제
      const { error } = await client
        .from("courses")
        .delete()
        .eq("id", courseId)
        .eq("profile_id", user.id);

      if (error) throw error;

      return redirect("/my-places");
    }

    return redirect(`/${courseId}/edit`);
  } catch (error) {
    console.error("Course edit error:", error);
    return { error: "작업을 완료할 수 없습니다." };
  }
};

export default function CourseEditPage({ loaderData }: Route.ComponentProps) {
  const { course, availablePlaces } = loaderData;
  const fetcher = useFetcher();

  const [courseName, setCourseName] = useState(course.name);
  const [courseDescription, setCourseDescription] = useState(
    course.description || "",
  );
  const [showAddPlaces, setShowAddPlaces] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [places, setPlaces] = useState(course.places);
  const [hasReordered, setHasReordered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 검색된 장소들
  const filteredAvailablePlaces = availablePlaces.filter(
    (place) =>
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (place.address &&
        place.address.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleUpdateCourse = () => {
    fetcher.submit(
      {
        actionType: "updateCourse",
        name: courseName,
        description: courseDescription,
      },
      { method: "post" },
    );
  };

  const handleAddPlace = (placeId: number) => {
    fetcher.submit(
      {
        actionType: "addPlace",
        placeId: placeId.toString(),
      },
      { method: "post" },
    );
    setShowAddPlaces(false);
  };

  const handleRemovePlace = (placeId: number) => {
    fetcher.submit(
      {
        actionType: "removePlace",
        placeId: placeId.toString(),
      },
      { method: "post" },
    );
  };

  const handleReorderPlaces = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setPlaces((prevPlaces) => {
        const newPlaces = [...prevPlaces];
        const draggedPlace = newPlaces[dragIndex];
        newPlaces.splice(dragIndex, 1);
        newPlaces.splice(hoverIndex, 0, draggedPlace);
        return newPlaces;
      });
      setHasReordered(true);
    },
    [],
  );

  // fetcher 상태 변화 감지하여 토스트 표시 (updateCourse 액션에만)
  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data?.success &&
      fetcher.data?.message
    ) {
      toast.success(fetcher.data.message);
    }
  }, [fetcher.state, fetcher.data]);

  // 장소 순서 변경을 서버에 전송하는 함수
  const submitReorder = useCallback(() => {
    if (hasReordered && places.length > 0) {
      const placeIds = places.map((place) => place.id);
      fetcher.submit(
        {
          actionType: "reorderPlaces",
          placeIds: JSON.stringify(placeIds),
        },
        { method: "post" },
      );
      setHasReordered(false);
    }
  }, [places, fetcher, hasReordered]);

  useEffect(() => {
    if (hasReordered) {
      const timeoutId = setTimeout(submitReorder, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [places, submitReorder, hasReordered]);

  const handleDeleteCourse = () => {
    fetcher.submit(
      {
        actionType: "deleteCourse",
      },
      { method: "post" },
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Toaster />
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/my-places">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                뒤로
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">코스 편집</h1>
              <p className="text-gray-600">
                장소를 추가하거나 제거하여 코스를 수정하세요
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            코스 삭제
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 코스 정보 편집 */}
          <Card>
            <CardHeader>
              <CardTitle>코스 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  코스 이름
                </label>
                <Input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="코스 이름을 입력하세요"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  코스 설명
                </label>
                <Textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="코스에 대한 설명을 입력하세요"
                  rows={4}
                />
              </div>
              <div className="pt-4">
                <Button
                  onClick={handleUpdateCourse}
                  disabled={fetcher.state !== "idle"}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 코스에 포함된 장소들 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>코스 장소 ({places.length}개)</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddPlaces(!showAddPlaces)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  장소 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {places.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p>코스에 포함된 장소가 없습니다</p>
                  <p className="text-sm">장소를 추가해보세요</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {places.map((place, index) => (
                    <DraggablePlaceItem
                      key={place.id}
                      place={place}
                      index={index}
                      onRemove={handleRemovePlace}
                      onMove={handleReorderPlaces}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 장소 추가 모달 */}
        {showAddPlaces && (
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>장소 추가</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddPlaces(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="장소 이름이나 주소로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {filteredAvailablePlaces.length === 0 ? (
                  <p className="py-8 text-center text-gray-500">
                    {searchTerm
                      ? "검색 결과가 없습니다"
                      : "추가할 수 있는 장소가 없습니다"}
                  </p>
                ) : (
                  filteredAvailablePlaces.map((place) => (
                    <div
                      key={place.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
                    >
                      <div>
                        <h4 className="font-medium">{place.name}</h4>
                        <p className="text-sm text-gray-600">{place.address}</p>
                        <Badge variant="secondary" className="mt-1">
                          {place.type}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddPlace(place.id)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        추가
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {fetcher.state === "submitting" ? (
        <div className="bg-opacity-75 fixed inset-0 flex items-center justify-center bg-gray-500">
          <div className="text-lg font-medium text-white">저장 중...</div>
        </div>
      ) : null}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-10 bg-opacity-75 bg-gray-500">
          <div className="mx-auto mt-20 w-96 rounded-lg bg-white p-8 shadow-lg">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              코스를 정말 삭제하시겠습니까?
            </h2>
            <p className="text-sm text-gray-600">
              코스를 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
            </p>
            <div className="mt-8 flex justify-end gap-4">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleDeleteCourse}>
                삭제
              </Button>
            </div>
          </div>
        </div>
      )}
    </DndProvider>
  );
}

// 드래그 가능한 장소 아이템 컴포넌트
interface DraggablePlaceItemProps {
  place: Place;
  index: number;
  onRemove: (placeId: number) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

function DraggablePlaceItem({
  place,
  index,
  onRemove,
  onMove,
}: DraggablePlaceItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: Identifier | null }
  >({
    accept: "place",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      onMove(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "place",
    item: () => {
      return { id: place.id.toString(), index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;
  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className="flex cursor-move items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-400" />
          <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
            {index + 1}
          </div>
        </div>
        <div>
          <h4 className="font-medium">{place.name}</h4>
          <p className="text-sm text-gray-600">{place.address}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(place.id)}
        className="text-red-600 hover:text-red-700"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
