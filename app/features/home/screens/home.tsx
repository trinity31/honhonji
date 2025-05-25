/**
 * Home Page Component
 *
 * This file implements the main landing page of the application with internationalization support.
 * It demonstrates the use of i18next for multi-language content, React Router's data API for
 * server-side rendering, and responsive design with Tailwind CSS.
 *
 * Key features:
 * - Server-side translation with i18next
 * - Client-side translation with useTranslation hook
 * - SEO-friendly metadata using React Router's meta export
 * - Responsive typography with Tailwind CSS
 */
import type { Route } from "./+types/home";

import {
  Coffee,
  Filter,
  Leaf,
  MapPin,
  Menu,
  Moon,
  Pizza,
  Salad,
  Search,
  Star,
  Sun,
  Utensils,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouteLoaderData } from "react-router";
import { Link } from "react-router";
import { type Theme, useTheme } from "remix-themes";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent } from "~/core/components/ui/card";
import { Input } from "~/core/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/core/components/ui/tabs";
import i18next from "~/core/lib/i18next.server";

// 전역 카카오 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

/**
 * Meta function for setting page metadata
 *
 * This function generates SEO-friendly metadata for the home page using data from the loader.
 * It sets:
 * - Page title from translated "home.title" key
 * - Meta description from translated "home.subtitle" key
 *
 * The metadata is language-specific based on the user's locale preference.
 *
 * @param data - Data returned from the loader function containing translated title and subtitle
 * @returns Array of metadata objects for the page
 */
export const meta: Route.MetaFunction = ({ data }) => {
  return [
    { title: data?.title },
    { name: "description", content: data?.subtitle },
  ];
};

/**
 * Loader function for server-side data fetching
 *
 * This function is executed on the server before rendering the component.
 * It:
 * 1. Extracts the user's locale from the request (via cookies or Accept-Language header)
 * 2. Creates a translation function for that specific locale
 * 3. Returns translated strings for the page title and subtitle
 *
 * This approach ensures that even on first load, users see content in their preferred language,
 * which improves both user experience and SEO (search engines see localized content).
 *
 * @param request - The incoming HTTP request containing locale information
 * @returns Object with translated title and subtitle strings
 */
export async function loader({ request }: Route.LoaderArgs) {
  // Get a translation function for the user's locale from the request
  const t = await i18next.getFixedT(request);

  // Return translated strings for use in both the component and meta function
  return {
    title: t("home.title"),
    subtitle: t("home.subtitle"),
  };
}

/**
 * Home page component
 *
 * This is the main landing page component of the application. It displays a simple,
 * centered layout with a headline and subtitle, both internationalized using i18next.
 *
 * Features:
 * - Uses the useTranslation hook for client-side translation
 * - Implements responsive design with Tailwind CSS
 * - Maintains consistent translations between server and client
 *
 * The component is intentionally simple to serve as a starting point for customization.
 * It demonstrates the core patterns used throughout the application:
 * - Internationalization
 * - Responsive design
 * - Clean, semantic HTML structure
 *
 * @returns JSX element representing the home page
 */
export default function Home() {
  // Get the translation function for the current locale
  const { t } = useTranslation();
  const [theme, setTheme] = useTheme();
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState({
    lat: 37.5665,
    lng: 126.978,
  }); // 기본값은 서울시청
  const rootData = useRouteLoaderData("root");
  const kakaoAppKey = rootData?.env?.KAKAO_APP_KEY || "";

  // 지도 마커 테스트용 샘플 식당 데이터 (3개)
  const sampleRestaurants = [
    {
      name: "행복밥상",
      lat: 37.475886,
      lng: 127.043201,
      description: "아침식사가 제공되는 가성비 좋고 푸짐한 식당",
      image: "/images/res1.png",
    },
    {
      name: "슬로우캘리 양재포이점",
      lat: 37.47622,
      lng: 127.043966,
      description: "신선한 재료로 만든 건강한 한끼, 비건 메뉴 제공",
      image: "/images/res2.jpeg",
    },
    {
      name: "버거베어 프리다이너",
      lat: 37.476268,
      lng: 127.039455,
      description:
        "5성급 호텔 셰프님이 만드는 육즙 폭발 퀄리티&가성비 수제버거 맛집",
      image: "/images/res3.jpeg",
    },
  ];

  // 카카오 지도 초기화
  useEffect(() => {
    // 카카오 지도 API 스크립트 동적 로드
    const script = document.createElement("script");

    console.log("rootData", rootData);
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
          // 샘플 식당 마커 표시
          sampleRestaurants.forEach((restaurant) => {
            const marker = new window.kakao.maps.Marker({
              map: mapRef.current,
              position: new window.kakao.maps.LatLng(
                restaurant.lat,
                restaurant.lng,
              ),
              title: restaurant.name,
            });
            // 이름만 항상 보이는 InfoWindow
            const nameWindow = new window.kakao.maps.InfoWindow({
              content: `<div style='padding:4px 8px;font-size:13px;font-weight:bold;background:#fff;border-radius:4px;border:1px solid #eee;'>${restaurant.name}</div>`,
              removable: false,
            });
            nameWindow.open(mapRef.current, marker);
            // 마커 클릭 시 설명 포함 InfoWindow
            const descWindow = new window.kakao.maps.InfoWindow({
              content: `<div style='padding:8px 12px;min-width:140px;font-size:14px;line-height:1.4;'><b>${restaurant.name}</b><br>${restaurant.description}</div>`,
            });
            window.kakao.maps.event.addListener(marker, "click", function () {
              nameWindow.close();
              descWindow.open(mapRef.current, marker);
            });
            // 지도 클릭 시 description 창 닫고 이름만 다시 표시
            window.kakao.maps.event.addListener(
              mapRef.current,
              "click",
              function () {
                descWindow.close();
                nameWindow.open(mapRef.current, marker);
              },
            );
          });
          console.log("카카오맵 초기화 시도 및 샘플 마커 표시");
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
    getUserLocation();

    // 지도가 초기화된 후 1초 후에 다시 위치 가져오기 시도
    const mapCheckInterval = setInterval(() => {
      if (mapRef.current) {
        getUserLocation();
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

    console.log("map 요소 찾음:", mapDiv);

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

      // 사용자 위치는 마커 없이 중앙에만 표시
      // 마커 제거 요청으로 사용자 위치 마커 코드 제거
      // 지도 중앙에 사용자 위치만 표시

      // 예시 데이터 - 실제로는 API에서 가져온 데이터를 사용할 것입니다
      const places = [
        {
          id: 1,
          name: "가게 이름 1",
          lat: userLocation.lat + 0.005,
          lng: userLocation.lng - 0.005,
          rating: 4.0,
          reviews: 123,
        },
        {
          id: 2,
          name: "가게 이름 2",
          lat: userLocation.lat - 0.003,
          lng: userLocation.lng + 0.004,
          rating: 3.0,
          reviews: 45,
        },
      ];

      // 가게 마커 추가
      places.forEach((place) => {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(place.lat, place.lng),
          map: kakaoMap,
        });

        // 마커 클릭 시 정보창 표시
        const infoContent = `
          <div style="width: 200px; padding: 8px;">
            <h3 style="font-weight: 600;">${place.name}</h3>
            <p style="font-size: 12px; color: #666;">가게 설명이 들어갑니다.</p>
            <div style="margin-top: 4px;">
              ${"★".repeat(Math.floor(place.rating))}${"☆".repeat(5 - Math.floor(place.rating))}
              <span style="margin-left: 4px; font-size: 12px;">${place.rating.toFixed(1)} (${place.reviews})</span>
            </div>
          </div>
        `;

        const infoWindow = new window.kakao.maps.InfoWindow({
          content: infoContent,
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          infoWindow.open(kakaoMap, marker);
        });
      });
    } catch (error) {
      console.error("카카오맵 초기화 중 오류 발생:", error);
    }
  };

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
                <p className="text-foreground max-w-full text-xl font-medium whitespace-normal sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
                  {t("home.subtitle")}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button className="bg-primary hover:bg-primary/90 gap-1 text-white">
                  <MapPin className="h-4 w-4 text-white" />내 주변 식당 찾기
                </Button>
                <Button
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary/10 hover:text-orange-500 dark:hover:text-white"
                >
                  추천 식당 둘러보기
                </Button>
              </div>
            </div>
            <div className="mx-auto flex w-full items-center justify-center">
              <Card className="w-full overflow-hidden border-none shadow-lg p-0">
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <img
                      src={sampleRestaurants[0].image}
                      alt={sampleRestaurants[0].name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        오늘의 추천식당
                      </span>
                    </div>
                    <div className="absolute right-4 bottom-4 left-4">
                      <p className="text-lg font-medium text-white">
                        {sampleRestaurants[0].name}
                      </p>
                      <p className="text-sm text-white/80">
                        {sampleRestaurants[0].description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <div className="w-full px-4 py-3 md:px-6">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="rounded-full border-orange-200 bg-orange-100 px-3 py-1 text-orange-600 hover:bg-orange-200"
          >
            가성비
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-purple-200 bg-purple-100 px-3 py-1 text-purple-600 hover:bg-purple-200"
          >
            1인석 있음
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-green-200 bg-green-100 px-3 py-1 text-green-600 hover:bg-green-200"
          >
            <Zap className="mr-1 h-3 w-3" /> 콘센트
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-yellow-200 bg-yellow-100 px-3 py-1 text-yellow-600 hover:bg-yellow-200"
          >
            <Sun className="mr-1 h-3 w-3" /> 아침식사
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-indigo-200 bg-indigo-100 px-3 py-1 text-indigo-600 hover:bg-indigo-200"
          >
            <Moon className="mr-1 h-3 w-3" /> 심야영업
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-pink-200 bg-pink-100 px-3 py-1 text-pink-600 hover:bg-pink-200"
          >
            <Salad className="mr-1 h-3 w-3" /> 다이어트
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-teal-200 bg-teal-100 px-3 py-1 text-teal-600 hover:bg-teal-200"
          >
            <Leaf className="mr-1 h-3 w-3" /> 비건
          </Badge>
        </div>
      </div>

      {/* Main Content with Map */}
      <main className="w-full flex-1">
        <div className="w-full px-4 py-6 md:px-6 md:py-8">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-primary text-xl font-bold whitespace-nowrap sm:text-2xl">
              주변 혼밥 식당
            </h2>
            <div className="flex items-center gap-1 sm:gap-2">
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
            </div>
          </div>

          <Tabs defaultValue="map" className="w-full">
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
                <div className="bg-muted relative aspect-[16/9] w-full md:aspect-[21/9] lg:aspect-[3/1]">
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Restaurant Card Example 1 */}
                <Card>
                  <CardContent className="p-4">
                    <img
                      src={sampleRestaurants[0].image}
                      alt={sampleRestaurants[0].name}
                      className="mb-3 aspect-[4/3] w-full rounded-md object-cover"
                    />
                    <h3 className="text-lg font-semibold">
                      {sampleRestaurants[0].name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {sampleRestaurants[0].description}
                    </p>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 mt-3 w-full"
                    >
                      자세히 보기
                    </Button>
                  </CardContent>
                </Card>
                {/* Restaurant Card 2 */}
                <Card>
                  <CardContent className="p-4">
                    <img
                      src={sampleRestaurants[1].image}
                      alt={sampleRestaurants[1].name}
                      className="mb-3 aspect-[4/3] w-full rounded-md object-cover"
                    />
                    <h3 className="text-lg font-semibold">
                      {sampleRestaurants[1].name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {sampleRestaurants[1].description}
                    </p>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 mt-3 w-full"
                    >
                      자세히 보기
                    </Button>
                  </CardContent>
                </Card>
                {/* Restaurant Card 3 */}
                <Card>
                  <CardContent className="p-4">
                    <img
                      src={sampleRestaurants[2].image}
                      alt={sampleRestaurants[2].name}
                      className="mb-3 aspect-[4/3] w-full rounded-md object-cover"
                    />
                    <h3 className="text-lg font-semibold">
                      {sampleRestaurants[2].name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {sampleRestaurants[2].description}
                    </p>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 mt-3 w-full"
                    >
                      자세히 보기
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
