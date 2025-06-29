import type { Route } from "./+types/home";

import { Filter, Loader, MapPin, Search, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";
import { useNavigate, useRouteLoaderData } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent } from "~/core/components/ui/card";
import { Checkbox } from "~/core/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/core/components/ui/sheet";
import { Toaster, toast } from "~/core/components/ui/sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/core/components/ui/tabs";
import i18next from "~/core/lib/i18next.server";
import { createSupabaseBrowserClient } from "~/core/lib/supa-client.client";
import makeServerClient from "~/core/lib/supa-client.server";
import { RestaurantCard } from "~/features/home/components/restaurant-card";
import { colorSets } from "~/features/places/constants";
import { getPlaceById } from "~/features/places/queries";

import {
  getAllTags,
  getOtherPlaces,
  getRandomRestaurant,
  getRestaurants,
} from "../../places/queries";
import { getLoggedInUserId } from "../../users/queries";
import { createCustomOverlays } from "../components/custom-overlays";
import {
  addPlaceToCourses,
  createCourse,
  removePlaceFromCourse,
} from "../mutations";
import { getUserCourses } from "../queries";

// 전역 카카오 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [
    { title: data?.title },
    { name: "description", content: data?.subtitle },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);

  // 병렬로 데이터 페칭하여 로딩 시간 단축
  const [restaurants, tags, otherPlaces, recommendedRestaurant, userCourses] =
    await Promise.all([
      getRestaurants(request, 37.55838, 126.922449),
      getAllTags(request),
      getOtherPlaces(request, 37.55838, 126.922449),
      getRandomRestaurant(request),
      getUserCourses(request),
    ]);

  return {
    title: t("home.title"),
    subtitle: t("home.subtitle"),
    restaurants,
    tags,
    otherPlaces,
    recommendedRestaurant,
    userCourses,
  };
}

export const action = async ({ request }: Route.ActionArgs) => {
  const [client, headers] = makeServerClient(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  // Helper function to return responses with proper headers
  const jsonResponse = (data: any, init?: ResponseInit) => {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        ...init?.headers,
        "Content-Type": "application/json",
        ...Object.fromEntries(headers.entries()),
      },
    });
  };

  if (intent === "create-course") {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
      const user = await getLoggedInUserId(client);

      if (!user) {
        throw new Error("User is not authenticated");
      }

      const newCourse = await createCourse({
        name: title,
        description,
        profile_id: user,
      });

      return jsonResponse({
        success: true,
        intent: "create-course",
        course: newCourse,
      });
    } catch (error) {
      return jsonResponse(
        {
          success: false,
          intent: "create-course",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 },
      );
    }
  }

  if (intent === "add-place-to-courses") {
    const placeId = Number(formData.get("placeId"));
    const courseIdsStr = formData.get("courseIds") as string;
    const courseIds = JSON.parse(courseIdsStr) as number[];

    if (!placeId || !courseIds?.length) {
      return jsonResponse(
        {
          success: false,
          intent: "add-place-to-courses",
          message: "유효하지 않은 장소 또는 코스 ID입니다.",
        },
        { status: 400 },
      );
    }

    try {
      // 장소 정보 조회
      const place = await getPlaceById(request, placeId);

      // 사용자 코스 정보 조회
      const userCourses = await getUserCourses(request);
      const courseNames = courseIds
        .map(
          (courseId) =>
            userCourses.find((course) => course.id === courseId)?.name,
        )
        .filter(Boolean);

      // client를 사용하는 대신 request를 직접 전달하여 접근하는 방식으로 변경
      const { results, errors } = await addPlaceToCourses(courseIds, placeId);

      if (errors.length > 0) {
        return jsonResponse({
          success: false,
          intent: "add-place-to-courses",
          message: "일부 코스에 장소를 추가하는데 실패했습니다.",
          errors,
          results,
        });
      }

      return jsonResponse({
        success: true,
        intent: "add-place-to-courses",
        message: "선택한 코스에 장소가 추가되었습니다.",
        placeName: place?.name || "장소",
        courseNames: courseNames,
        results,
      });
    } catch (error) {
      return jsonResponse(
        {
          success: false,
          intent: "add-place-to-courses",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  }

  if (intent === "remove-place-from-course") {
    const placeId = Number(formData.get("placeId"));
    const courseId = Number(formData.get("courseId"));

    if (!placeId || !courseId) {
      return jsonResponse(
        {
          success: false,
          intent: "remove-place-from-course",
          message: "유효하지 않은 장소 또는 코스 ID입니다.",
        },
        { status: 400 },
      );
    }

    try {
      // 장소 정보 조회
      const place = await getPlaceById(request, placeId);

      // 사용자 코스 정보 조회
      const userCourses = await getUserCourses(request);
      const courseName = userCourses.find(
        (course) => course.id === courseId,
      )?.name;

      const result = await removePlaceFromCourse(courseId, placeId);

      return jsonResponse({
        success: true,
        intent: "remove-place-from-course",
        message: "장소가 코스에서 성공적으로 제거되었습니다.",
        placeName: place?.name || "장소",
        courseName: courseName || "코스",
        result,
      });
    } catch (error) {
      return jsonResponse(
        {
          success: false,
          intent: "remove-place-from-course",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 },
      );
    }
  }

  return null;
};

export default function Home({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    restaurants,
    tags: allTagsFromLoader,
    otherPlaces,
    recommendedRestaurant,
    userCourses,
  } = loaderData;
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState({
    lat: 37.55838,
    lng: 126.922449,
  }); // 기본값은 서울시청
  const rootData = useRouteLoaderData("root");
  const kakaoAppKey = rootData?.env?.KAKAO_APP_KEY || "";

  // 선택된 태그 상태 관리
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("map");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isCreateCourseDialogOpen, setIsCreateCourseDialogOpen] =
    useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  // 선택된 장소가 이미 코스에 포함되어 있는지 확인하고 체크 상태 설정
  useEffect(() => {
    const getPlaceInCourses = async (placeId: number) => {
      try {
        const client = createSupabaseBrowserClient();

        // 현재 사용자의 ID 가져오기
        const {
          data: { user },
          error: userError,
        } = await client.auth.getUser();

        if (userError || !user) {
          console.error("Supabase user error:", userError);
          return [];
        }

        // 사용자가 소유한 코스 중 해당 장소가 포함된 코스 가져오기
        const { data, error } = await client
          .from("course_places")
          .select(
            `
            course_id,
            courses!inner(profile_id)
          `,
          )
          .eq("place_id", placeId)
          .eq("courses.profile_id", user.id);

        if (error) {
          console.error("Error fetching course places:", error);
          return [];
        }

        // course_id만 배열로 추출
        return data ? data.map((item) => item.course_id) : [];
      } catch (error) {
        console.error("Unexpected error in getPlaceInCourses:", error);
        return [];
      }
    };

    const checkPlaceInCourses = async () => {
      if (selectedPlaceId && sheetOpen) {
        const coursesWithPlace = await getPlaceInCourses(
          Number(selectedPlaceId),
        );
        setSelectedCourses(coursesWithPlace);
      }
    };

    checkPlaceInCourses();
  }, [selectedPlaceId, sheetOpen]);

  // 필터링된 식당 목록
  // 기타 장소용 마커 이미지 URL (실제 URL로 교체 필요)
  const MARKER_OTHER_IMAGE_SRC =
    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; // 예시: 파란색 별 마커
  const MARKER_DEFAULT_IMAGE_SRC = ""; // 기본 카카오 마커를 사용하려면 빈 문자열 또는 null

  const filteredRestaurants =
    selectedTags.length > 0
      ? restaurants.filter((restaurant) =>
          restaurant.tags?.some((tag) => selectedTags.includes(tag.name)),
        )
      : restaurants;

  // 태그 클릭 핸들러 - 선택/해제 토글
  const handleTagClick = (tagName: string) => {
    setSelectedTags(
      (prev) =>
        prev.includes(tagName)
          ? prev.filter((tag) => tag !== tagName) // 이미 선택된 태그라면 해제
          : [...prev, tagName], // 선택되지 않은 태그라면 추가
    );
  };

  const fetcher = useFetcher();

  // fetcher 상태 모니터링하여 토스트 표시
  useEffect(() => {
    console.log("Fetcher state:", fetcher.state);
    console.log("Fetcher data:", fetcher.data);

    if (fetcher.state === "idle" && fetcher.data) {
      const data = fetcher.data as any;
      console.log("Processing fetcher data:", data);

      if (data.success) {
        // 성공적으로 처리된 경우
        if (data.intent === "add-place-to-courses") {
          const placeName = data.placeName || "장소";
          const courseNames = data.courseNames || [];
          const courseNamesText =
            courseNames.length > 0 ? courseNames.join(", ") : "선택한 코스";
          console.log(
            `${placeName}이(가) ${courseNamesText}에 추가되었습니다.`,
          );
          toast.success(
            `${placeName}이(가) ${courseNamesText}에 추가되었습니다.`,
          );
        } else if (data.intent === "remove-place-from-course") {
          const placeName = data.placeName || "장소";
          const courseName = data.courseName || "코스";
          console.log(`${placeName}이(가) ${courseName}에서 제거되었습니다.`);
          toast.success(`${placeName}이(가) ${courseName}에서 제거되었습니다.`);
        } else if (data.intent === "create-course") {
          const courseName = data.course?.name || "새 코스";
          console.log(`${courseName}이(가) 생성되었습니다.`);
          toast.success(`${courseName}이(가) 생성되었습니다.`);
          setIsCreateCourseDialogOpen(false);
          setNewCourseTitle("");
          setNewCourseDescription("");
        }
      } else {
        // 오류가 발생한 경우
        console.log("Error occurred:", data.message);
        toast.error(data.message || "작업 중 오류가 발생했습니다.");
      }
    }
  }, [fetcher.state, fetcher.data]);

  const handleCreateCourse = () => {
    fetcher.submit(
      {
        intent: "create-course",
        title: newCourseTitle,
        description: newCourseDescription,
      },
      { method: "POST" },
    );
    // Reset fields and close dialog
    setNewCourseTitle("");
    setNewCourseDescription("");
    setIsCreateCourseDialogOpen(false);
  };

  // 마커와 오버레이 참조 저장
  const markersRef = useRef<any[]>([]);
  const nameWindowsRef = useRef<any[]>([]);
  const descWindowsRef = useRef<any[]>([]);
  const overlaysWithListeners = useRef(new WeakSet()).current;

  // loaderData에서 가져온 데이터의 타입을 명시적으로 정의
  type Place = (typeof restaurants)[0];

  // 지도에 표시된 마커 업데이트 함수
  const updateMapMarkers = () => {
    if (!mapRef.current) return;

    // 기존 마커와 오버레이 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    nameWindowsRef.current.forEach((overlay) => overlay.setMap(null));
    descWindowsRef.current.forEach((overlay) => overlay.setMap(null));

    // 배열 초기화
    markersRef.current = [];
    nameWindowsRef.current = [];
    descWindowsRef.current = [];

    // 마커 이미지 객체 생성 (이제 레스토랑/카페용)
    const restaurantCafeMarkerImage = MARKER_OTHER_IMAGE_SRC
      ? new window.kakao.maps.MarkerImage(
          MARKER_OTHER_IMAGE_SRC,
          new window.kakao.maps.Size(24, 35),
        )
      : null; // 기본 마커 사용 시 null

    // 마커와 오버레이, 이벤트 리스너를 추가하는 헬퍼 함수
    const addMarker = (place: Place, isOtherPlace = false) => {
      if (!place.lat || !place.lng) return;

      const marker = new window.kakao.maps.Marker({
        map: mapRef.current,
        position: new window.kakao.maps.LatLng(place.lat, place.lng),
        title: isOtherPlace ? `${place.name} (기타)` : place.name,
        image: isOtherPlace ? null : restaurantCafeMarkerImage,
      });

      const { nameWindow, descWindow } = createCustomOverlays(marker, place);

      nameWindow.setMap(mapRef.current);

      window.kakao.maps.event.addListener(marker, "click", function () {
        nameWindow.setMap(null);
        descWindow.setMap(mapRef.current);

        if (!overlaysWithListeners.has(descWindow)) {
          setTimeout(() => {
            // HACK: Kakao Maps SDK의 CustomOverlay 객체에서 getElement() 함수가
            // 예상대로 동작하지 않아, 내부 프로퍼티 'a'에 직접 접근합니다.
            // 이 프로퍼티는 콘솔 로그 분석 결과 오버레이의 DOM 요소를 담고 있는 것으로 보입니다.
            // SDK 업데이트 시 변경될 수 있는 불안정한 방법이지만, 현재 문제를 해결하기 위한 해결책입니다.
            const overlayElement = (descWindow as any).a;
            const detailButton = overlayElement?.querySelector(
              ".overlay-details-button",
            );
            if (detailButton) {
              detailButton.addEventListener("click", () => {
                navigate(`/places/${place.id}`);
              });
            }

            const saveToCourseButton = overlayElement?.querySelector(
              ".save-to-course-button",
            );

            if (saveToCourseButton) {
              saveToCourseButton.addEventListener("click", (e: MouseEvent) => {
                e.preventDefault();
                setSelectedPlaceId(String(place.id));
                setSheetOpen(true);
              });
            }

            overlaysWithListeners.add(overlayElement);
          }, 0);
        }
      });

      window.kakao.maps.event.addListener(mapRef.current, "click", function () {
        descWindow.setMap(null);
        nameWindow.setMap(mapRef.current);
      });

      markersRef.current.push(marker);
      nameWindowsRef.current.push(nameWindow);
      descWindowsRef.current.push(descWindow);
    };

    // 필터링된 식당/카페 표시
    filteredRestaurants.forEach((place) => addMarker(place, false));

    // 기타 장소 표시
    otherPlaces.forEach((place) => addMarker(place, true));
  };

  // 선택된 태그가 변경될 때 마커 업데이트
  useEffect(() => {
    if (mapRef.current) {
      updateMapMarkers();
    }
  }, [selectedTags]);

  useEffect(() => {
    const script = document.createElement("script");
    console.log("kakaoAppKey", kakaoAppKey);
    // root loader에서 전달받은 환경 변수 사용

    if (!kakaoAppKey) {
      console.error("KAKAO_APP_KEY 환경 변수가 설정되지 않았습니다.");
    }
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoAppKey}&autoload=false`;
    script.async = true;

    script.onload = () => {
      // 카카오맵 로드
      window.kakao.maps.load(() => {
        // 지도 초기화 시간 지연 추가
        setTimeout(() => {
          initializeMap();
          // 필터링된 식당 마커 표시
          updateMapMarkers();
          console.log("카카오맵 초기화 시도 및 필터링된 마커 표시");
        }, 500);
      });
    };

    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 처리
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, []);

  // 사용자 위치 가져오기
  useEffect(() => {
    // 위치 정보 가져오기 함수
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("사용자 위치 가져옴:", latitude, longitude);
            setUserLocation({ lat: latitude, lng: longitude });

            // 지도가 이미 초기화된 경우 중심점 변경
            if (mapRef.current) {
              try {
                const newCenter = new window.kakao.maps.LatLng(
                  latitude,
                  longitude,
                );
                mapRef.current.setCenter(newCenter);
                console.log("지도 중심 이동 완료");

                // 사용자 위치 마커 제거 요청으로 마커 업데이트 코드 제거
                // 지도 중앙에만 사용자 위치 표시
              } catch (e) {
                console.error("지도 중심 이동 오류:", e);
              }
            } else {
              console.log("아직 지도가 초기화되지 않음");
            }
          },
          (error) => {
            console.error("위치 정보를 가져오는데 실패했습니다:", error);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
        );
      } else {
        console.error("이 브라우저에서는 위치 정보를 지원하지 않습니다.");
      }
    };

    // 초기 위치 가져오기
    //getUserLocation();

    // 지도가 초기화된 후 1초 후에 다시 위치 가져오기 시도
    const mapCheckInterval = setInterval(() => {
      if (mapRef.current) {
        // getUserLocation();
        clearInterval(mapCheckInterval);
      }
    }, 1000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      clearInterval(mapCheckInterval);
    };
  }, []);

  // 지도 초기화 함수
  const initializeMap = () => {
    if (!window.kakao || !window.kakao.maps) {
      console.error("카카오 지도 API가 로드되지 않았습니다.");
      return;
    }

    const mapDiv = document.getElementById("map");
    if (!mapDiv) {
      console.error("map 요소를 찾을 수 없습니다:", mapDiv);
      return;
    }

    try {
      const mapOptions = {
        center: new window.kakao.maps.LatLng(
          userLocation.lat,
          userLocation.lng,
        ),
        level: 3, // 확대 레벨 (숫자가 작을수록 더 확대됨)
      };

      const kakaoMap = new window.kakao.maps.Map(mapDiv, mapOptions);
      console.log("지도 생성 성공");
      mapRef.current = kakaoMap;

      // 지도 컨트롤 추가
      const zoomControl = new window.kakao.maps.ZoomControl();
      kakaoMap.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

      // 지도 초기화 후 마커 업데이트
      updateMapMarkers();
    } catch (error) {
      console.error("카카오맵 초기화 중 오류 발생:", error);
    }
  };

  // 탭 변경 시 지도 재초기화를 위한 useEffect 추가
  useEffect(() => {
    if (activeTab === "map" && window.kakao && window.kakao.maps) {
      // 지도 탭으로 전환될 때 약간의 지연 후 지도 재초기화
      const timer = setTimeout(() => {
        const mapDiv = document.getElementById("map");
        if (mapDiv && !mapRef.current) {
          initializeMap();
        }
      }, 100);

      return () => clearTimeout(timer);
    } else if (activeTab === "list") {
      // 목록 보기로 전환할 때 지도 참조 초기화
      if (mapRef.current) {
        mapRef.current = null;
      }
    }
  }, [activeTab, userLocation]);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="bg-primary/10 w-full pt-0 pb-2 md:pb-3 dark:bg-[#0e0e1b]">
        <div className="w-full">
          <div className="grid w-full grid-cols-1 gap-6 overflow-hidden px-2 py-8 md:px-4 md:py-12 lg:grid-cols-[1fr_400px] lg:gap-8 lg:px-6 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-primary text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t("home.midtitle")}
                </h1>
                <p className="text-foreground max-w-full text-lg font-medium whitespace-normal sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
                  {t("home.subtitle")}
                </p>
              </div>
              {/* <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button className="bg-primary hover:bg-primary/90 gap-1 text-white">
                  <MapPin className="h-4 w-4 text-white" />내 주변 식당 찾기
                </Button>
                <Button
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary/10 hover:text-orange-500 dark:hover:text-white"
                >
                  추천 식당 둘러보기
                </Button>
              </div> */}
            </div>
            <div className="mx-auto flex w-full items-center justify-center">
              {recommendedRestaurant && (
                <Card
                  className="w-full cursor-pointer overflow-hidden border-none p-0 shadow-lg transition-shadow hover:shadow-md"
                  onClick={() =>
                    navigate(`/places/${recommendedRestaurant.id}`)
                  }
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <img
                        src={
                          recommendedRestaurant.image_url ||
                          "/images/default-restaurant.png"
                        }
                        alt={recommendedRestaurant.name || "Restaurant image"}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary rounded-full px-2.5 py-1 text-xs font-semibold text-white">
                          {"랜덤 추천식당"}
                        </span>
                      </div>
                      <div className="absolute right-4 bottom-4 left-4">
                        <p className="text-lg font-medium text-white">
                          {recommendedRestaurant.name}
                        </p>
                        <p className="truncate text-sm text-white/80">
                          {recommendedRestaurant.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <div className="w-full px-4 py-3 md:px-6">
        <div className="flex flex-wrap gap-2">
          {loaderData.tags.map((tag, index) => {
            // 태그 인덱스에 따라 색상 세트를 순환하며 적용
            const colorIndex = index % colorSets.length;
            const style = colorSets[colorIndex];

            // 태그가 선택되었는지 확인
            const isSelected = selectedTags.includes(tag.name);

            return (
              <Badge
                key={tag.id}
                variant="outline"
                className={`rounded-full ${style.border} ${style.bg} px-3 py-1 ${style.text} ${style.hover} cursor-pointer transition-all ${isSelected ? "ring-primary font-semibold ring-2 ring-offset-1" : "opacity-80"} `}
                onClick={() => handleTagClick(tag.name)}
              >
                {tag.name}
                {isSelected && <span className="ml-1">✓</span>}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Main Content with Map */}
      <main className="w-full flex-1">
        <div className="w-full px-4 py-6 md:px-6 md:py-8">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-primary text-xl font-bold whitespace-nowrap sm:text-2xl">
              주변 혼밥 식당
            </h2>
            {/* <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-secondary text-secondary hover:bg-secondary/10 gap-1 px-2 sm:px-3"
              >
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">필터</span>
              </Button>
              <div className="relative min-w-0">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <Input
                  type="search"
                  placeholder="검색..."
                  className="w-full min-w-[120px] rounded-md pr-2 pl-7 text-sm sm:pr-3 sm:pl-8 sm:text-base md:w-[160px] lg:w-[200px]"
                />
              </div>
            </div> */}
          </div>

          <Tabs
            defaultValue="map"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="bg-muted/50 mb-4">
              <TabsTrigger
                value="map"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                지도 보기
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                목록 보기
              </TabsTrigger>
            </TabsList>
            <TabsContent value="map" className="mt-0">
              <div className="relative w-full overflow-hidden rounded-lg border shadow-lg">
                {/* Map View */}
                <div className="bg-muted relative aspect-[3/4] w-full sm:aspect-[1/1] md:aspect-[4/3] lg:aspect-[16/9]">
                  <div className="absolute inset-0">
                    <div
                      id="map"
                      className="relative h-full w-full"
                      style={{ minHeight: "400px" }}
                    ></div>
                  </div>

                  {/* Map Markers Examples - 실제 구현 시 동적으로 생성 */}
                  <div className="absolute top-[30%] left-[20%]">
                    <div className="group relative">
                      <MapPin className="text-primary h-8 w-8 cursor-pointer" />
                      <div className="absolute -top-28 -left-24 w-56 rounded-md bg-white p-2 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                        <h3 className="font-semibold">가게 이름 1</h3>
                        <p className="text-muted-foreground text-xs">
                          가게 설명이 들어갑니다.
                        </p>
                        <div className="mt-1 flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <Star className="text-muted-foreground fill-muted-foreground h-3 w-3" />
                          <span className="ml-1 text-xs">4.0 (123)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-[50%] left-[50%]">
                    <div className="group relative">
                      <MapPin className="text-primary h-8 w-8 cursor-pointer" />
                      <div className="absolute -top-28 -left-24 w-56 rounded-md bg-white p-2 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                        <h3 className="font-semibold">가게 이름 2</h3>
                        <p className="text-muted-foreground text-xs">
                          다른 가게 설명입니다.
                        </p>
                        <div className="mt-1 flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <Star className="text-muted-foreground fill-muted-foreground h-3 w-3" />
                          <Star className="text-muted-foreground fill-muted-foreground h-3 w-3" />
                          <span className="ml-1 text-xs">3.0 (45)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="list" className="mt-0">
              {selectedTags.length > 0 && (
                <div className="mb-4 px-1">
                  <p className="text-muted-foreground text-sm">
                    <span className="text-primary font-medium">
                      {filteredRestaurants.length}
                    </span>
                    개의 식당이 선택된 태그
                    <span className="text-primary font-medium">
                      {selectedTags.map((tag, i) =>
                        i === selectedTags.length - 1
                          ? `'${tag}'`
                          : `'${tag}', `,
                      )}
                    </span>
                    에 해당합니다.
                  </p>
                </div>
              )}

              {filteredRestaurants.length === 0 ? (
                <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed">
                  <p className="text-muted-foreground">
                    선택한 태그에 해당하는 식당이 없습니다.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      onViewDetails={() => navigate(`/places/${restaurant.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>코스에 장소 추가</SheetTitle>
            <SheetDescription>
              이 장소를 어떤 코스에 추가하시겠습니까?
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 py-0">
            {userCourses && userCourses.length > 0 ? (
              <div className="mb-4 space-y-1">
                <div className="space-y-1">
                  {userCourses.map((course: any) => (
                    <div
                      key={course.id}
                      className="flex items-center space-x-2 rounded-md p-2"
                    >
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={async (checked: boolean) => {
                          if (checked) {
                            // 체크박스 체크 시 코스에 장소 추가
                            fetcher.submit(
                              {
                                intent: "add-place-to-courses",
                                placeId: selectedPlaceId,
                                courseIds: JSON.stringify([course.id]),
                              },
                              { method: "POST" },
                            );
                            setSelectedCourses([...selectedCourses, course.id]);
                          } else {
                            // 체크박스 해제 시 코스에서 장소 제거
                            fetcher.submit(
                              {
                                intent: "remove-place-from-course",
                                placeId: selectedPlaceId,
                                courseId: course.id,
                              },
                              { method: "POST" },
                            );
                            setSelectedCourses(
                              selectedCourses.filter((id) => id !== course.id),
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`course-${course.id}`}
                        className="flex-1 cursor-pointer text-sm"
                      >
                        {course.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {/* 버튼 제거됨 */}
              </div>
            ) : (
              <div className="mb-4 rounded-md bg-gray-50 p-4 text-sm text-gray-500">
                <p>아직 만든 코스가 없습니다. 새 코스를 추가해보세요.</p>
              </div>
            )}
            <Button
              onClick={() => {
                setSheetOpen(false);
                setIsCreateCourseDialogOpen(true);
              }}
              variant="default"
              className="w-full bg-orange-500 text-white hover:bg-orange-600"
            >
              새 코스 추가하기
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      <Dialog
        open={isCreateCourseDialogOpen}
        onOpenChange={setIsCreateCourseDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>새 코스 만들기</DialogTitle>
            <DialogDescription>
              새로운 코스의 제목과 설명을 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                제목
              </Label>
              <Input
                id="title"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                설명
              </Label>
              <Input
                id="description"
                value={newCourseDescription}
                onChange={(e) => setNewCourseDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateCourseDialogOpen(false)}
            >
              취소
            </Button>
            <Button type="submit" onClick={handleCreateCourse}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
