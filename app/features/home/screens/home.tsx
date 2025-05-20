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
  MapPin,
  Menu,
  Moon,
  Pizza,
  Search,
  Star,
  Sun,
  Utensils,
} from "lucide-react";
import { useTranslation } from "react-i18next";
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

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="bg-primary/10 dark:bg-primary/5 w-full pt-0 pb-2 md:pb-3">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-primary text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t("home.midtitle")}
                </h1>
                <h2 className="text-foreground text-xl font-semibold tracking-tighter sm:text-4xl md:text-5xl">
                  혼자여도 특별한 한 끼와 식책을 발견하세요!
                </h2>
                <p className="text-muted-foreground max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("home.subtitle")}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button className="bg-primary hover:bg-primary/90 gap-1">
                  <MapPin className="h-4 w-4" />내 주변 식당 찾기
                </Button>
                <Button
                  variant="outline"
                  className="border-secondary text-secondary hover:bg-secondary/10"
                >
                  추천 식당 둘러보기
                </Button>
              </div>
            </div>
            <div className="mx-auto flex w-full items-center justify-center">
              <Card className="w-full overflow-hidden border-none shadow-lg">
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <img
                      src="/placeholder.svg?height=400&width=800&text=오늘의+추천+맛집"
                      alt="혼밥 이미지"
                      className="object-cover"
                      width={800}
                      height={400}
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute right-4 bottom-4 left-4">
                      <p className="text-lg font-medium text-white">
                        오늘의 추천 식당
                      </p>
                      <p className="text-sm text-white/80">
                        혼자서도 편안하게 즐길 수 있는 맛집
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
      <div className="container px-4 py-4 md:px-6">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          <Badge
            variant="outline"
            className="rounded-full border-red-200 bg-red-100 px-3 py-1 text-red-600 hover:bg-red-200"
          >
            <Utensils className="mr-1 h-3 w-3" /> 한식
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-blue-200 bg-blue-100 px-3 py-1 text-blue-600 hover:bg-blue-200"
          >
            <Coffee className="mr-1 h-3 w-3" /> 카페
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-yellow-200 bg-yellow-100 px-3 py-1 text-yellow-600 hover:bg-yellow-200"
          >
            <Pizza className="mr-1 h-3 w-3" /> 양식
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-green-200 bg-green-100 px-3 py-1 text-green-600 hover:bg-green-200"
          >
            혼밥 맛집
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-purple-200 bg-purple-100 px-3 py-1 text-purple-600 hover:bg-purple-200"
          >
            1인석 있음
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-orange-200 bg-orange-100 px-3 py-1 text-orange-600 hover:bg-orange-200"
          >
            가성비
          </Badge>
          <Badge
            variant="outline"
            className="rounded-full border-teal-200 bg-teal-100 px-3 py-1 text-teal-600 hover:bg-teal-200"
          >
            신규 오픈
          </Badge>
        </div>
      </div>

      {/* Main Content with Map */}
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 md:py-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-primary text-2xl font-bold">주변 혼밥 식당</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-secondary text-secondary hover:bg-secondary/10 gap-1"
              >
                <Filter className="h-4 w-4" />
                필터
              </Button>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="식당 검색..."
                  className="w-full rounded-md pl-8 md:w-[200px] lg:w-[300px]"
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
                    <img
                      src="/placeholder.svg?height=800&width=1600&text=지도+영역"
                      alt="지도"
                      className="h-full w-full object-cover"
                    />
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
                      src="/placeholder.svg?height=200&width=400&text=식당+이미지+1"
                      alt="식당 이미지 1"
                      className="mb-3 h-40 w-full rounded-md object-cover"
                    />
                    <h3 className="text-lg font-semibold">식당 이름 1</h3>
                    <p className="text-muted-foreground text-sm">
                      서울시 강남구 | 한식
                    </p>
                    <div className="mt-1 flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="text-muted-foreground fill-muted-foreground h-4 w-4" />
                      <span className="ml-1 text-xs">4.0 (123)</span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 mt-3 w-full"
                    >
                      자세히 보기
                    </Button>
                  </CardContent>
                </Card>
                {/* Restaurant Card Example 2 */}
                <Card>
                  <CardContent className="p-4">
                    <img
                      src="/placeholder.svg?height=200&width=400&text=식당+이미지+2"
                      alt="식당 이미지 2"
                      className="mb-3 h-40 w-full rounded-md object-cover"
                    />
                    <h3 className="text-lg font-semibold">식당 이름 2</h3>
                    <p className="text-muted-foreground text-sm">
                      서울시 마포구 | 양식
                    </p>
                    <div className="mt-1 flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <Star className="text-muted-foreground fill-muted-foreground h-4 w-4" />
                      <Star className="text-muted-foreground fill-muted-foreground h-4 w-4" />
                      <span className="ml-1 text-xs">3.2 (56)</span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 mt-3 w-full"
                    >
                      자세히 보기
                    </Button>
                  </CardContent>
                </Card>
                {/* Add more restaurant cards as needed */}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
