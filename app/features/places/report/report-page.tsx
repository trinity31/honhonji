import type { LucideIcon } from "lucide-react";

import type { Route } from "./+types/report-page";

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
import { useActionData, useFetcher, useNavigation } from "react-router";
import { z } from "zod";

import { Badge } from "~/core/components/ui/badge";
import { Label } from "~/core/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/core/components/ui/radio-group";
import { cn } from "~/core/lib/utils";

export const loader = async ({ request }: Route.LoaderArgs) => {
  return {
    tags: [
      {
        id: "price",
        label: "가성비",
        icon: "DollarSign",
        color:
          "bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-200",
      },
      {
        id: "solotable",
        label: "1인석",
        icon: "Users",
        color: "bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200",
      },
      {
        id: "outlet",
        label: "콘센트",
        icon: "Zap",
        color:
          "bg-green-100 text-green-600 border-green-200 hover:bg-green-200",
      },
      {
        id: "breakfast",
        label: "아침식사",
        icon: "Sunrise",
        color:
          "bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200",
      },
      {
        id: "night",
        label: "야식",
        icon: "Moon",
        color:
          "bg-indigo-100 text-indigo-600 border-indigo-200 hover:bg-indigo-200",
      },
      {
        id: "diet",
        label: "다이어트",
        icon: "Salad",
        color:
          "bg-emerald-100 text-emerald-600 border-emerald-200 hover:bg-emerald-200",
      },
      {
        id: "vegan",
        label: "비건",
        icon: "Leaf",
        color: "bg-teal-100 text-teal-600 border-teal-200 hover:bg-teal-200",
      },
    ],
  };
};

type PlaceType = "restaurant" | "walking_trail";

// Zod 스키마 정의 - 장소 타입에 따라 다른 검증 로직 적용
const restaurantSchema = z.object({
  placeType: z.literal("restaurant"),
  placeName: z.string().min(1, "장소명은 필수입니다"),
  address: z.string().min(1, "주소는 필수입니다"),
  detailAddress: z.string().optional(),
  tags: z.string().optional(),
  content: z.string().optional(),
});

const walkingTrailSchema = z.object({
  placeType: z.literal("walking_trail"),
  placeName: z.string().min(1, "산책로 이름은 필수입니다"),
  address: z.string().optional(),
  tags: z.string().optional(),
  content: z.string().optional(),
});

const formSchema = z.discriminatedUnion("placeType", [
  restaurantSchema,
  walkingTrailSchema,
]);

// 네이버 지역 검색 API 호출 함수 (서버 사이드)
export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
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
    //console.log("서버 응답 데이터:", searchResult);

    // 검색 결과가 있는지 확인
    if (searchResult && searchResult.items && searchResult.items.length > 0) {
      return { success: true, items: searchResult.items };
    } else {
      return { success: false, error: "검색 결과가 없습니다" };
    }
  } catch (error) {
    console.error("네이버 API 호출 중 오류:", error);
    return { error: "장소 검색 중 오류가 발생했습니다" };
  }
};

export default function ReportPlacePage({ loaderData }: Route.ComponentProps) {
  // 서버 액션을 호출하기 위한 fetcher 생성
  const fetcher = useFetcher();
  const navigation = useNavigation();

  const [selectedTags, setSelectedTags] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [placeName, setPlaceName] = useState("");
  const [placeType, setPlaceType] = useState<PlaceType>("restaurant");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 폼 제출 핸들러 - Zod 검증 포함
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const formValues = {
      placeType: formData.get("placeType") as PlaceType,
      placeName: formData.get("placeName") as string,
      address: formData.get("address") as string,
      detailAddress: placeType === "restaurant" ? formData.get("detailAddress") as string || "" : undefined,
      tags: formData.get("tags") as string || "",
      content: formData.get("content") as string || "",
    };
    
    try {
      // Zod 스키마로 검증
      formSchema.parse(formValues);
      // 검증 성공 시 폼 제출
      e.currentTarget.submit();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Zod 에러 메시지를 객체로 변환
        const errorMap: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          errorMap[field] = err.message;
        });
        setErrors(errorMap);
        setIsSubmitting(false);
        // 첫 번째 에러 필드로 스크롤
        const firstErrorField = document.getElementById(Object.keys(errorMap)[0]);
        firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

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
  const [address, setAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ name: string; address: string; roadAddress: string }>
  >([]);

  const { tags } = loaderData;

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
    if (fetcher.data) {
      if (fetcher.data.error) {
        alert(fetcher.data.error);
      } else if (
        fetcher.data.success &&
        fetcher.data.items &&
        fetcher.data.items.length > 0
      ) {
        setShowResults(true);
        setSearchResults(
          fetcher.data.items.map((item: any) => ({
            name: item.title.replace(/<[^>]*>/g, ""),
            address: item.address,
            roadAddress: item.roadAddress,
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

  const toggleTag = (tag: { id: string; label: string; icon: string }) => {
    setSelectedTags((prev) =>
      prev.some((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, { id: tag.id, label: tag.label }],
    );
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">새로운 장소 추천</h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* 장소 타입 선택 */}
        <div>
          <label className="mb-2 block font-medium">장소 타입 <span className="text-red-500">*</span></label>
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

                  // fetcher.submit을 사용하여 서버 액션 호출
                  const formData = new FormData();
                  formData.append("placeName", placeName);

                  fetcher.submit(formData, {
                    method: "post",
                    action: "?/search",
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
            {tags.map((tag) => {
              const isSelected = selectedTags.some((t) => t.id === tag.id);
              const Icon = iconComponents[tag.icon];

              return (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className={`cursor-pointer rounded-full px-3 py-1 transition-colors ${tag.color} ${
                    isSelected
                      ? "ring-primary ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-950"
                      : ""
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {Icon && <Icon className="mr-1 h-3 w-3" />}
                  {tag.label}
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-3 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "제출 중..." : "추천하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
