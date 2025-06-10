import type { LucideIcon } from "lucide-react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import type { Route } from "./+types/submittion-page";

import {
  Clock,
  DollarSign,
  Heart,
  MapPin,
  Moon,
  Sun,
  Users,
  Utensils,
  Wifi,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher, useLoaderData, useNavigation } from "react-router";
import { z } from "zod";

import { Badge } from "~/core/components/ui/badge";
import { Label } from "~/core/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/core/components/ui/radio-group";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

import { colorSets } from "../places/constants";
import { getAllTags } from "../places/queries";
import { getLoggedInUserId } from "../users/queries";
import { submitPlace } from "./mutations";

type FetcherData = {
  intent?: string;
  success?: boolean;
  error?: string;
  message?: string;
  errors?: Record<string, string>;
  items?: Array<{
    title?: string;
    address?: string;
    roadAddress?: string;
  }>;
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const tags = await getAllTags(request);
  return { tags };
};

type PlaceType = "restaurant" | "walking_trail";

// Zod 스키마 정의 - 장소 타입에 따라 다른 검증 로직 적용
const restaurantSchema = z.object({
  placeType: z.literal("restaurant"),
  placeName: z.string().min(1, "장소명은 필수입니다"),
  address: z.string().min(1, "주소는 필수입니다"),
  detailAddress: z.string().optional(),
  tags: z.string().transform((str) => (str ? JSON.parse(str) : [])),
  content: z.string().optional(),
});

const walkingTrailSchema = z.object({
  placeType: z.literal("walking_trail"),
  placeName: z.string().min(1, "산책로 이름은 필수입니다"),
  address: z.string().optional(),
  tags: z.string().transform((str) => (str ? JSON.parse(str) : [])),
  content: z.string().optional(),
});

const formSchema = z.discriminatedUnion("placeType", [
  restaurantSchema,
  walkingTrailSchema,
]);

// 폼 제출 및 네이버 지역 검색 API 호출을 처리하는 액션
export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  // 검색 요청 처리
  if (intent === "search") {
    const placeName = formData.get("placeName") as string;
    console.log("검색어:", placeName);

    if (!placeName) {
      return { error: "검색어가 필요합니다" };
    }

    try {
      // 네이버 API 설정
      const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
      const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

      // API 키가 설정되지 않은 경우 에러 반환
      if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
        console.error("네이버 API 키가 설정되지 않았습니다");
        return { error: "API 키가 설정되지 않았습니다" };
      }

      let apiUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(placeName)}&display=10`;

      console.log("API URL:", apiUrl);

      // 네이버 지역 검색 API 호출
      const response = await fetch(apiUrl, {
        headers: {
          "X-Naver-Client-Id": NAVER_CLIENT_ID,
          "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
        },
      });

      // API 호출 실패 시 에러 반환
      if (!response.ok) {
        throw new Error(`네이버 API 오류: ${response.status}`);
      }

      // 검색 결과 반환
      const searchResult = await response.json();

      // 검색 결과가 있는지 확인
      if (searchResult && searchResult.items && searchResult.items.length > 0) {
        return { success: true, items: searchResult.items, intent: "search" };
      } else {
        return {
          success: false,
          error: "검색 결과가 없습니다",
          intent: "search",
        };
      }
    } catch (error) {
      console.error("네이버 API 호출 중 오류:", error);
      return { error: "장소 검색 중 오류가 발생했습니다", intent: "search" };
    }
  }

  // 폼 제출 처리
  if (intent === "submit") {
    try {
      // const formValues = {
      //   placeType: formData.get("placeType") as PlaceType,
      //   placeName: formData.get("placeName") as string,
      //   address: formData.get("address") as string,
      //   detailAddress: formData.get("detailAddress") as string | undefined,
      //   tags: formData.get("tags") as string,
      //   content: formData.get("content") as string,
      // };

      // console.log(formValues);

      const [client] = makeServerClient(request);
      const userId = await getLoggedInUserId(client);
      // const formData = await request.formData();

      console.log("Form data entries:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value, typeof value);
      }
      // Zod 스키마로 검증
      const { success, error, data } = formSchema.safeParse(
        Object.fromEntries(formData),
      );

      // 검증 실패 시 에러 반환
      if (!success) {
        console.log(error);
        return {
          fieldErrors: error.flatten().fieldErrors,
        };
      }

      console.log("Success:");
      console.log(data);

      // 여기서 실제 데이터베이스 저장 로직을 구현하세요
      // 예: await saveToDatabase(result.data);
      await submitPlace(client, {
        type: data.placeType === "restaurant" ? "restaurant" : "trail",
        name: data.placeName,
        address: data.address || null, // undefined인 경우 null로 변환
        tags: data.tags,
        description: data.content,
        userId: userId,
      });

      // 성공 응답 반환
      return {
        success: true,
        message: "장소가 성공적으로 제출되었습니다!",
        intent: "submit",
      };
    } catch (error) {
      console.error("폼 제출 중 오류:", error);
      return {
        success: false,
        error: "폼 제출 중 오류가 발생했습니다",
        intent: "submit",
      };
    }
  }

  // 알 수 없는 요청 유형
  return { error: "잘못된 요청입니다" };
};

export default function ReportPlacePage() {
  const { tags } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<FetcherData>();
  const navigation = useNavigation();

  const [selectedTags, setSelectedTags] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [placeName, setPlaceName] = useState("");
  const [placeType, setPlaceType] = useState<PlaceType>("restaurant");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ name: string; address: string; roadAddress: string }>
  >([]);

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("intent", "submit");

    // fetcher를 사용하여 폼 제출
    fetcher.submit(formData, {
      method: "post",
    });
  };

  // 폼 제출 결과 처리
  useEffect(() => {
    if (fetcher.data?.intent === "submit") {
      setIsSubmitting(false);

      if (fetcher.data.success) {
        // 성공 처리 (예: 성공 메시지 표시 또는 리다이렉트)
        alert(fetcher.data.message || "제출이 완료되었습니다!");
        // 폼 초기화 또는 리다이렉트 로직 추가
      } else if (fetcher.data.errors) {
        // 유효성 검사 오류 처리
        setErrors(fetcher.data.errors);
        // 첫 번째 에러 필드로 스크롤
        const firstErrorKey = Object.keys(fetcher.data.errors)[0];
        if (firstErrorKey) {
          const firstErrorField = document.getElementById(firstErrorKey);
          firstErrorField?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      } else if (fetcher.data.error) {
        // 기타 오류 처리
        alert(fetcher.data.error);
      }
    }
  }, [fetcher.data]);

  // 장소 타입 변경 이벤트 처리
  const handlePlaceTypeChange = (type: PlaceType) => {
    setPlaceType(type);
    setErrors({}); // 타입 변경 시 오류 초기화

    // 산책로로 변경 시 검색 결과 초기화
    if (type === "walking_trail") {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  // 페이지 로딩 상태 처리
  useEffect(() => {
    setIsSearching(navigation.state === "submitting");
  }, [navigation.state]);

  // fetcher 상태 관리
  useEffect(() => {
    // 로딩 상태 관리
    if (fetcher.state === "submitting") {
      setIsSearching(true);
    } else if (fetcher.state === "idle") {
      setIsSearching(false);
    }
  }, [fetcher.state]);

  // 검색 결과 처리
  useEffect(() => {
    if (fetcher.data?.intent === "search") {
      if (fetcher.data.error) {
        alert(fetcher.data.error);
      } else if (
        fetcher.data.success &&
        fetcher.data.items &&
        fetcher.data.items.length > 0
      ) {
        setShowResults(true);
        setSearchResults(
          fetcher.data.items.map((item) => ({
            name: item.title?.replace(/<[^>]*>/g, "") || "",
            address: item.address || "",
            roadAddress: item.roadAddress || "",
          })),
        );
      } else {
        setSearchResults([]);
        alert("검색 결과가 없습니다.");
      }
    }
  }, [fetcher.data]);

  const iconComponents: Record<string, LucideIcon> = {
    Wifi,
    Zap,
    Clock,
    Moon,
    Users,
    Heart,
    DollarSign,
    MapPin,
    Utensils,
    Sun,
  };

  const toggleTag = (tag: { id: number; name: string }) => {
    setSelectedTags((prevTags) =>
      prevTags.some((t) => t.id === String(tag.id))
        ? prevTags.filter((t) => t.id !== String(tag.id))
        : [...prevTags, { id: String(tag.id), name: tag.name }],
    );
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">새로운 장소 추천</h1>

      <fetcher.Form method="post" className="space-y-6" onSubmit={handleSubmit}>
        {/* 장소 타입 선택 */}
        <div>
          <label className="mb-2 block font-medium">
            장소 타입 <span className="text-red-500">*</span>
          </label>
          <RadioGroup
            defaultValue="restaurant"
            className="flex gap-4"
            value={placeType}
            onValueChange={(value) => handlePlaceTypeChange(value as PlaceType)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="restaurant" id="restaurant" />
              <Label htmlFor="restaurant">식당/카페</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="walking_trail" id="walking_trail" />
              <Label htmlFor="walking_trail">산책로</Label>
            </div>
          </RadioGroup>
          <input type="hidden" name="placeType" value={placeType} />
        </div>

        {/* 장소명 */}
        <div>
          <label htmlFor="placeName" className="mb-2 block font-medium">
            장소명 <span className="text-red-500">*</span>
          </label>

          {placeType === "restaurant" ? (
            /* 식당/카페인 경우 네이버 검색 UI 표시 */
            <div className="flex space-x-2">
              <input
                type="text"
                id="placeName"
                name="placeName"
                required
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                className={`flex-1 rounded-md border p-2 ${errors.placeName ? "border-red-500" : ""}`}
                placeholder="예) 혼밥카페 연남점"
              />
              {errors.placeName && (
                <p className="mt-1 text-sm text-red-500">{errors.placeName}</p>
              )}
              <button
                id="searchButton"
                type="button"
                className="rounded-md bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                disabled={isSearching}
                onClick={() => {
                  if (!placeName.trim()) {
                    alert("장소명을 입력해주세요.");
                    return;
                  }
                  setIsSearching(true);
                  setShowResults(true);

                  // 서버 액션 호출을 위한 폼 데이터 준비
                  const formData = new FormData();
                  formData.append("placeName", placeName);
                  formData.append("intent", "search");

                  // fetcher를 사용하여 서버 액션 호출
                  fetcher.submit(formData, {
                    method: "post",
                  });
                }}
              >
                {isSearching ? "검색 중..." : "검색"}
              </button>
            </div>
          ) : (
            /* 산책로인 경우 직접 입력 UI 표시 */
            <div>
              <input
                type="text"
                id="placeName"
                name="placeName"
                required
                value={placeName}
                onChange={(e) => setPlaceName(e.target.value)}
                className={`w-full rounded-md border p-2 ${errors.placeName ? "border-red-500" : ""}`}
                placeholder="산책로 이름을 직접 입력해주세요 (예: 연남동 갈대역 산책로)"
              />
              {errors.placeName && (
                <p className="mt-1 text-sm text-red-500">{errors.placeName}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                * 산책로는 직접 입력해주세요. 주변 랜드마크나 지역명을 포함하면
                더 쉽게 찾을 수 있습니다.
              </p>
            </div>
          )}

          {/* 검색 결과 표시 */}
          {showResults && searchResults.length > 0 && (
            <div className="mt-2 rounded-md border bg-white p-2 dark:bg-gray-800">
              <p className="mb-2 text-sm text-gray-500">
                검색 결과를 선택하세요:
              </p>
              <ul className="max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <li
                    key={index}
                    className="cursor-pointer border-b p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      setPlaceName(result.name);
                      setAddress(result.roadAddress || result.address);
                      setShowResults(false);
                    }}
                  >
                    <div className="font-medium">{result.name}</div>
                    <div className="text-xs text-gray-500">
                      {result.roadAddress || result.address}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 태그 선택 */}
        <div>
          <label className="mb-3 block text-sm font-medium">
            태그 선택{" "}
            <span className="text-muted-foreground">(여러 개 선택 가능)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => {
              // 태그 인덱스에 따라 색상 세트를 순환하며 적용
              const colorIndex = index % colorSets.length;
              const style = colorSets[colorIndex];

              // 태그가 선택되었는지 확인 (문자열로 변환하여 비교)
              const isSelected = selectedTags.some(
                (t) => t.id === String(tag.id),
              );

              return (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className={`rounded-full ${style.border} ${style.bg} px-3 py-1 ${style.text} ${style.hover} cursor-pointer transition-all ${isSelected ? "ring-primary font-semibold ring-2 ring-offset-1" : "opacity-80"} `}
                  onClick={() => toggleTag(tag)}
                >
                  {tag.name}
                  {isSelected && <span className="ml-1">✓</span>}
                </Badge>
              );
            })}
          </div>
          <input
            type="hidden"
            name="tags"
            value={JSON.stringify(selectedTags.map((t) => t.id))}
          />
        </div>

        {/* 주소 */}
        <div>
          <label htmlFor="address" className="mb-2 block font-medium">
            주소{" "}
            {placeType === "restaurant" ? (
              <span className="text-red-500">*</span>
            ) : (
              <span className="text-gray-500">(선택)</span>
            )}
          </label>

          {placeType === "restaurant" ? (
            /* 식당/카페인 경우 주소 검색 버튼 표시 */
            <div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`flex-1 rounded-md border p-2 ${errors.address ? "border-red-500" : ""}`}
                  placeholder="업소명 검색 후 주소가 자동으로 입력됩니다"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                )}
                <button
                  type="button"
                  className="rounded-md bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => {
                    if (!placeName.trim()) {
                      alert("먼저 장소명을 입력하고 검색해주세요.");
                      return;
                    }
                    // 장소명 검색 버튼 클릭과 동일한 효과
                    document.getElementById("searchButton")?.click();
                  }}
                >
                  주소 검색
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                * 장소명 검색 시 주소가 자동으로 입력됩니다
              </p>
            </div>
          ) : (
            /* 산책로인 경우 직접 입력 안내 */
            <div>
              <input
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full rounded-md border p-2 ${errors.address ? "border-red-500" : ""}`}
                placeholder="산책로 시작점 주소나 랜드마크를 입력해주세요"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                * 산책로 직접 입력은 주변 랜드마크나 지역명을 포함하여
                입력해주세요.
              </p>
            </div>
          )}
        </div>

        {/* 상세 주소 - 식당/카페인 경우에만 표시 */}
        {placeType === "restaurant" && (
          <div>
            <label htmlFor="detailAddress" className="mb-2 block font-medium">
              상세 주소
            </label>
            <input
              type="text"
              id="detailAddress"
              name="detailAddress"
              className="w-full rounded-md border p-2"
              placeholder="상세 주소가 있는 경우 입력해 주세요(선택)"
            />
          </div>
        )}

        {/* 추천 내용 */}
        <div>
          <label htmlFor="content" className="mb-2 block font-medium">
            추천 이유
          </label>
          <textarea
            id="content"
            name="content"
            rows={4}
            className="w-full rounded-md border p-2"
            placeholder="왜 이 장소를 추천하고 싶은지 간단히 써 주세요"
          ></textarea>
        </div>

        {/* 제출 버튼 */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-3 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "제출 중..." : "추천하기"}
          </button>
        </div>
      </fetcher.Form>
    </div>
  );
}
