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
import { useEffect, useState, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "~/core/lib/supa-client.client";
import { useFetcher, useLoaderData, useNavigation } from "react-router";
import { z } from "zod";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { Label } from "~/core/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/core/components/ui/radio-group";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

import { colorSets, PLACE_TYPES } from "../places/constants";
import { getAllTags } from "../places/queries";
import { getLoggedInUserId } from "../users/queries";
import { submitPlace } from "./mutations";
import { getCoordinatesFromAddress } from "~/core/lib/naver-geocoding";

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
  latitude?: number;
  longitude?: number;
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const tags = await getAllTags(request);
  return { tags };
};

type PlaceType = (typeof PLACE_TYPES)[number]['value'];

// Zod 스키마 정의 - 장소 타입에 따라 다른 검증 로직 적용
// 레스토랑/카페 스키마 (태그 필수)
const restaurantSchema = z.object({
  placeType: z.literal("restaurant"),
  placeName: z.string().min(1, "장소명은 필수입니다"),
  address: z.string().min(1, "주소는 필수입니다"),
  detailAddress: z.string().nullable().optional(),
  tags: z.string().transform((str) => (str ? JSON.parse(str) : [])),
  content: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  homepage: z.string().url({ message: "유효한 URL을 입력해주세요." }).optional().or(z.literal('')),
  instagram: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val.trim() === "") return "";
      let username = val.trim();
      if (username.startsWith("@")) {
        username = username.substring(1);
      }
      const urlPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?/;
      const match = username.match(urlPattern);
      if (match && match[3]) {
        username = match[3];
      }
      return username;
    })
    .refine(
      (username) => {
        if (username === "") return true;
        return /^[a-zA-Z0-9._]{1,30}$/.test(username);
      },
      {
        message: "인스타그램 계정 형식이 올바르지 않습니다. 계정 아이디만 입력하거나 유효한 인스타그램 URL을 입력해주세요.",
      }
    )
    .transform((username) => {
      if (username === "") return "";
      return `https://www.instagram.com/${username}/`;
    })
    .or(z.literal("")),
  naver: z.string().url({ message: "유효한 URL을 입력해주세요." }).optional().or(z.literal(''))
});

const cafeSchema = z.object({
  placeType: z.literal("cafe"),
  placeName: z.string().min(1, "장소명은 필수입니다"),
  address: z.string().min(1, "주소는 필수입니다"),
  detailAddress: z.string().nullable().optional(),
  tags: z.string().transform((str) => (str ? JSON.parse(str) : [])),
  content: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  homepage: z.string().url({ message: "유효한 URL을 입력해주세요." }).optional().or(z.literal('')),
  instagram: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val.trim() === "") return "";
      let username = val.trim();
      if (username.startsWith("@")) {
        username = username.substring(1);
      }
      const urlPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?/;
      const match = username.match(urlPattern);
      if (match && match[3]) {
        username = match[3];
      }
      return username;
    })
    .refine(
      (username) => {
        if (username === "") return true;
        return /^[a-zA-Z0-9._]{1,30}$/.test(username);
      },
      {
        message: "인스타그램 계정 형식이 올바르지 않습니다. 계정 아이디만 입력하거나 유효한 인스타그램 URL을 입력해주세요.",
      }
    )
    .transform((username) => {
      if (username === "") return "";
      return `https://www.instagram.com/${username}/`;
    })
    .or(z.literal("")),
  naver: z.string().url({ message: "유효한 URL을 입력해주세요." }).optional().or(z.literal(''))
});

// 기타 장소 타입 스키마 (태그 선택사항, 주소 선택사항)
// "restaurant"와 "cafe"를 제외한 PlaceType 값들의 배열을 생성
const otherPlaceTypeValues = PLACE_TYPES
  .filter(t => t.value !== "restaurant" && t.value !== "cafe")
  .map(t => t.value) as [PlaceType, ...PlaceType[]];

const otherPlaceSchema = z.object({
  placeType: z.enum(otherPlaceTypeValues), // z.enum에는 non-empty array가 필요합니다.
  placeName: z.string().min(1, "장소명은 필수입니다"),
  address: z.string().optional().or(z.literal('')), // 주소는 선택사항
  detailAddress: z.string().nullable().optional(),
  tags: z.string().transform(() => []), // 태그는 항상 빈 배열로 설정
  content: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  homepage: z.string().url({ message: "유효한 URL을 입력해주세요." }).optional().or(z.literal('')),
  instagram: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val.trim() === "") return "";
      let username = val.trim();
      if (username.startsWith("@")) {
        username = username.substring(1);
      }
      const urlPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?/;
      const match = username.match(urlPattern);
      if (match && match[3]) {
        username = match[3];
      }
      return username;
    })
    .refine(
      (username) => {
        if (username === "") return true;
        return /^[a-zA-Z0-9._]{1,30}$/.test(username);
      },
      {
        message: "인스타그램 계정 형식이 올바르지 않습니다. 계정 아이디만 입력하거나 유효한 인스타그램 URL을 입력해주세요.",
      }
    )
    .transform((username) => {
      if (username === "") return "";
      return `https://www.instagram.com/${username}/`;
    })
    .or(z.literal("")),
  naver: z.string().url({ message: "유효한 URL을 입력해주세요." }).optional().or(z.literal('')),
});

const formSchema = z.discriminatedUnion("placeType", [
  restaurantSchema,
  cafeSchema,
  otherPlaceSchema,
]);

// 폼 제출 및 네이버 지역 검색 API 호출을 처리하는 액션
export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  // 검색 요청 처리
  if (intent === "search") { /* 기존 검색 로직 유지 */
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
      const [client] = makeServerClient(request);
      const userId = await getLoggedInUserId(client);

      const latString = formData.get("latitude") as string | null;
      const lngString = formData.get("longitude") as string | null;

      const parseOptionalFloat = (val: string | null): number | undefined => {
        if (val === null || val.trim() === "") return undefined;
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      };

      // Zod 스키마로 검증
      const parsedData = {
        placeType: formData.get("placeType"),
        placeName: formData.get("placeName"),
        address: formData.get("address"),
        detailAddress: formData.get("detailAddress"),
        tags: formData.get("tags"),
        content: formData.get("content"),
        latitude: parseOptionalFloat(latString),
        longitude: parseOptionalFloat(lngString),
      };

      const addressString = formData.get("address") as string | null;
      let latitude: number | undefined = undefined;
      let longitude: number | undefined = undefined;

      if (addressString && addressString.trim() !== "") {
        console.log("[Server Action] Performing geocoding for address:", addressString);
        const coordinates = await getCoordinatesFromAddress(addressString.trim());
        if (coordinates) {
          latitude = coordinates.latitude;
          longitude = coordinates.longitude;
          console.log("[Server Action] Geocoding successful:", { latitude, longitude });
        } else {
          console.log("[Server Action] Geocoding failed for address:", addressString);
        }
      } else {
        console.log("[Server Action] No address provided, skipping geocoding.");
      }

      const submissionDataWithCoords = {
        ...parsedData,
        latitude,
        longitude,
      };

      console.log("[Server Action] Data for Zod validation:", submissionDataWithCoords);
      const { success, error, data } = formSchema.safeParse(submissionDataWithCoords);

      // 검증 실패 시 에러 반환
      if (!success) {
        console.error("Zod validation failed:", error.flatten().fieldErrors);
        return {
          fieldErrors: error.flatten().fieldErrors,
          message: "입력 값을 확인해주세요.",
        };
      }

      console.log("Zod validation successful, submitting data with coordinates:", data);

      const content = formData.get("content") as string | null;
      const image_url = formData.get("image_url") as string | null;
      const phone = formData.get("phone") as string | null;
      const homepage = formData.get("homepage") as string | null;
      const instagram = formData.get("instagram") as string | null;
      const naver = formData.get("naver") as string | null;
      const detailAddress = formData.get("detailAddress") as string | null;

      // 데이터베이스에 저장
      await submitPlace(client, {
        placeType: data.placeType, // Zod에서 추론된 타입을 사용
        placeName: data.placeName,
        address: data.address?.trim() || null,
        tags: (['restaurant', 'cafe'] as PlaceType[]).includes(data.placeType) ? data.tags : [],
        content: data.content,
        userId: userId,
        latitude: data.latitude,
        longitude: data.longitude,
        image_url: image_url || undefined, // Ensure undefined if empty
        phone: phone || undefined,
        homepage: homepage || undefined,
        instagram: instagram || undefined,
        naver: naver || undefined,
        detailAddress: detailAddress || undefined,
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
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [homepage, setHomepage] = useState("");
  const [instagram, setInstagram] = useState("");
  const [naver, setNaver] = useState("");

  const submissionProcessedRef = useRef(false);

  const resetFormFields = useCallback(() => {
    setPlaceType(PLACE_TYPES[0].value);
    setPlaceName("");
    setAddress("");
    setDetailAddress("");
    setSelectedTags([]);
    setContent("");
    setLatitude(undefined);
    setLongitude(undefined);
    setErrors({});
    setShowResults(false);
    setSearchResults([]);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPhone("");
    setHomepage("");
    setInstagram("");
    setNaver("");
    // isSubmitting, isSearching은 fetcher.state에 따라 별도 useEffect에서 관리
  }, [setPlaceType, setPlaceName, setAddress, setDetailAddress, setSelectedTags, setContent, setLatitude, setLongitude, setErrors, setShowResults, setSearchResults, setPhone, setHomepage, setInstagram, setNaver]);

  // 폼 제출 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget; // Store form element reference
    setIsSubmitting(true);
    submissionProcessedRef.current = false;

    let imageUrl = "";
    if (imageFile) {
      const supabase = createSupabaseBrowserClient();
      const fileName = `${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("places")
        .upload(`public/${fileName}`, imageFile);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        alert("이미지 업로드에 실패했습니다.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("places")
        .getPublicUrl(uploadData.path);
      
      imageUrl = urlData.publicUrl;
    }

    setErrors({});
    // setIsSubmitting(true); // Already set at the beginning
    setShowResults(false); // 제출 시 검색 결과 숨기기

    const formData = new FormData(formElement); // Use stored form element reference
    const formValues = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;

    const addressValue = formValues.address?.trim() || "";
    if (['restaurant', 'cafe'].includes(placeType) && !addressValue) {
      setErrors((prev) => ({
        ...prev,
        address: "주소는 필수 입력 항목입니다.",
      }));
      setIsSubmitting(false);
      return;
    }

    formData.set("address", addressValue);
    formData.set("placeType", placeType);

    if (imageUrl) {
      formData.set("image_url", imageUrl);
    }

    if (['restaurant', 'cafe'].includes(placeType)) {
      formData.set("tags", JSON.stringify(selectedTags.map((tag) => tag.id)));
    } else {
      formData.set("tags", "[]");
    }

    formData.append("intent", "submit");

    fetcher.submit(formData, {
      method: "post",
    });
  };

  // isSubmitting 및 isSearching 상태 관리, submissionProcessedRef 초기화
  useEffect(() => {
    const currentIntent = fetcher.formData?.get("intent") as string | undefined;
    if (fetcher.state === "submitting" || fetcher.state === "loading") {
      if (currentIntent === "submit") {
        setIsSubmitting(true);
        submissionProcessedRef.current = false; // 새 제출 시작 시 리셋
      } else if (currentIntent === "search") {
        setIsSearching(true);
      }
    } else {
      // state가 idle, actionDone 등일 때
      if (currentIntent === "submit") setIsSubmitting(false);
      if (currentIntent === "search") setIsSearching(false);
    }
  }, [fetcher.state, fetcher.formData]);

  // fetcher.data 결과 처리 (제출 완료 또는 검색 결과)
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      const { intent, success, message, errors: fetcherErrors, items } = fetcher.data as FetcherData;

      if (intent === "submit") {
        if (!submissionProcessedRef.current) {
          if (success) {
            alert(message || "추천을 완료했습니다.");
            resetFormFields();
          } else {
            if (fetcherErrors) {
              setErrors(fetcherErrors);
            }
            alert(message || fetcher.data.error || "오류가 발생했습니다.");
          }
          submissionProcessedRef.current = true;
          setIsSubmitting(false); // Reset submitting state
        }
      } else if (intent === "search") {
        if (items) {
          const mappedItems = items.map(item => ({
            name: item.title || "", 
            address: item.address || "", 
            roadAddress: item.roadAddress || "",
          }));
          setSearchResults(mappedItems);
        } else if (fetcher.data.error) {
          console.error("Search error:", fetcher.data.error);
          setSearchResults([]);
        }
      }
    }
  }, [fetcher.data, fetcher.state, resetFormFields]);

  // 기존 fetcher.data 처리 로직은 위의 useEffect로 통합되었으므로 삭제 또는 주석 처리합니다.
  // useEffect(() => {
  //   if (fetcher.data?.intent === "submitPlace") {
  //     setIsSubmitting(false);
  //     if (fetcher.data.success) {
  //       alert(fetcher.data.message || "추천을 완료했습니다.");
  //       resetFormFields();
  //     } else if (fetcher.data.errors) {
  //       setErrors(fetcher.data.errors);
  //     } else if (fetcher.data.error) {
  //       alert(`오류: ${fetcher.data.error}`);
  //     }
  //   }
  // }, [fetcher.data, resetFormFields]);

  // ...
  // 장소 타입 변경 핸들러
  const handlePlaceTypeChange = (type: PlaceType) => {
    setPlaceType(type);
    setErrors({});
    setSelectedTags([]);
    setAddress("");
    setPlaceName("");
    setShowResults(false);
    setLatitude(undefined);
    setLongitude(undefined);
  };

  // 태그 토글 핸들러
  const toggleTag = (tag: { id: number; name: string }) => {
    setSelectedTags((prev) => {
      const existing = prev.find((t) => t.id === String(tag.id));
      if (existing) {
        return prev.filter((t) => t.id !== String(tag.id));
      } else {
        return [...prev, { id: String(tag.id), name: tag.name }];
      }
    });
  };

  const handleSearch = () => {
    if (!placeName.trim()) {
      alert("장소명을 입력해주세요.");
      return;
    }
    setIsSearching(true);
    setShowResults(true);

    const formData = new FormData();
    formData.append("placeName", placeName);
    formData.append("intent", "search");

    fetcher.submit(formData, {
      method: "post",
    });
  };

  // 검색 결과 처리
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.intent === "search") {
      setIsSearching(false);
      if (fetcher.data.success && fetcher.data.items) {
        setSearchResults(
          fetcher.data.items.map((item) => ({
            name: item.title || "",
            address: item.address || "",
            roadAddress: item.roadAddress || "",
          })),
        );
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(true); // 검색 결과 없음 메시지를 표시하기 위해
      }
    } 
  }, [fetcher.data, fetcher.state]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">새로운 장소 추천</h1>

      <fetcher.Form method="post" className="space-y-6" onSubmit={handleSubmit}>
        {/* 장소 타입 선택 */}
        <div>
          <label className="mb-2 block font-medium">
            장소 타입 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {PLACE_TYPES.map((type) => {
              const isSelected = placeType === type.value;
              const colorIndex =
                PLACE_TYPES.findIndex((t) => t.value === type.value) %
                colorSets.length;
              const style = colorSets[colorIndex];
              return (
                <div key={type.value} className="flex items-center">
                  <input
                    type="radio"
                    id={type.value}
                    name="placeType"
                    value={type.value}
                    checked={isSelected}
                    onChange={() =>
                      handlePlaceTypeChange(type.value as PlaceType)
                    }
                    className="sr-only"
                  />
                  <label
                    htmlFor={type.value}
                    className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      isSelected
                        ? `${style.bg} ${style.text} ${style.border} font-semibold`
                        : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                    }`}
                  >
                    {type.label}
                  </label>
                </div>
              );
            })}
          </div>
          <input type="hidden" name="placeType" value={placeType} />
        </div>

        {/* 장소명 및 주소 검색 */}
        <div>
          <label htmlFor="placeName" className="mb-2 block font-medium">
            장소명 <span className="text-red-500">*</span>
          </label>
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-2">
              <input
                type="text"
                id="placeName"
                name="placeName"
                required
                value={placeName}
                onChange={(e) => {
                  setPlaceName(e.target.value);
                  if (showResults) {
                    setShowResults(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent default form submission
                    handleSearch(); // Call the search handler directly
                  }
                }}
                className={`w-full rounded-md border p-2 ${
                  errors.placeName ? "border-red-500" : ""
                }`}
                placeholder="장소명을 입력하고 검색 버튼을 누르세요"
              />
              {errors.placeName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.placeName}
                </p>
              )}

              {/* 검색 결과 목록 */}
              {showResults && (
                <ul className="mt-2 rounded-md border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {isSearching ? (
                    <li className="p-3 text-center text-gray-500">검색 중...</li>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((item, index) => (
                      <li key={index}>
                        <button
                          type="button"
                          className="w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            setPlaceName(item.name.replace(/<[^>]*>?/gm, ''));
                            setAddress(item.roadAddress || item.address);
                            setShowResults(false);
                          }}
                        >
                          <span
                            className="font-semibold"
                            dangerouslySetInnerHTML={{ __html: item.name }}
                          ></span>
                          <br />
                          <span className="text-sm text-gray-500">
                            {item.roadAddress || item.address}
                          </span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="p-3 text-center text-gray-500">
                      검색 결과가 없습니다.
                    </li>
                  )}
                </ul>
              )}
            </div>

            <button
              id="search-button"
              type="button"
              className="rounded-md bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
              disabled={isSearching}
              onClick={handleSearch}
            >
              {isSearching ? "검색 중..." : "검색"}
            </button>
          </div>
        </div>

        {/* 태그 - 레스토랑/카페인 경우에만 표시 */}
        {['restaurant', 'cafe'].includes(placeType) && (
          <div>
            <label className="mb-2 block font-medium">
              태그 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const colorIndex = tag.id % colorSets.length;
                const style = colorSets[colorIndex];
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
              value={JSON.stringify(selectedTags.map((tag) => tag.id))}
            />
          </div>
        )}

        {/* 주소 */}
        <div>
          <label htmlFor="address" className="mb-2 block font-medium">
            주소{' '}
            {['restaurant', 'cafe'].includes(placeType) ? (
              <span className="text-red-500">*</span>
            ) : (
              <span className="text-gray-500">(선택)</span>
            )}
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-md border p-2"
            placeholder="주소를 검색하거나 직접 입력해주세요"
            required={['restaurant', 'cafe'].includes(placeType)}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
          )}
        </div>

        {/* 상세 주소 - 레스토랑/카페인 경우에만 표시 */}
        {['restaurant', 'cafe'].includes(placeType) && (
          <div>
            <label htmlFor="detailAddress" className="mb-2 block font-medium">
              상세 주소
            </label>
            <input
              type="text"
              id="detailAddress"
              name="detailAddress"
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
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
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-md border p-2"
            placeholder="왜 이 장소를 추천하고 싶은지 간단히 써 주세요"
          ></textarea>
        </div>

        {/* 사진 첨부 */}
        <div>
          <label className="mb-2 block font-semibold">사진 첨부</label>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleImageChange} 
            className="hidden" 
          />
          <Button type="button" onClick={() => fileInputRef.current?.click()} className="mb-2">
            이미지 선택
          </Button>
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="h-48 w-auto rounded-md object-cover" />
            </div>
          )}
        </div>

        {/* 전화번호 */}
        <div className="space-y-1">
          <Label htmlFor="phone" className="text-sm font-medium">
            전화번호 <span className="text-xs text-gray-500">(선택)</span>
          </Label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border p-2 text-sm"
            placeholder="02-1234-5678"
          />
        </div>

        {/* 홈페이지 */}
        <div className="space-y-1">
          <Label htmlFor="homepage" className="text-sm font-medium">
            홈페이지 <span className="text-xs text-gray-500">(선택)</span>
          </Label>
          <input
            type="url"
            id="homepage"
            name="homepage"
            value={homepage}
            onChange={(e) => setHomepage(e.target.value)}
            className="w-full rounded-md border p-2 text-sm"
            placeholder="https://example.com"
          />
        </div>

        {/* 인스타그램 */}
        <div className="space-y-1">
          <Label htmlFor="instagram" className="text-sm font-medium">
            인스타그램 <span className="text-xs text-gray-500">(선택)</span>
          </Label>
          <input
            type="text"
            id="instagram"
            name="instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="w-full rounded-md border p-2 text-sm"
            placeholder="https://instagram.com/username 또는 계정명"
          />
        </div>

        {/* 네이버 플레이스 */}
        <div className="space-y-1">
          <Label htmlFor="naver" className="text-sm font-medium">
            네이버 플레이스 <span className="text-xs text-gray-500">(선택)</span>
          </Label>
          <input
            type="url"
            id="naver"
            name="naver"
            value={naver}
            onChange={(e) => setNaver(e.target.value)}
            className="w-full rounded-md border p-2 text-sm"
            placeholder="네이버 플레이스 URL"
          />
        </div>

        {/* 제출 버튼 */}
        <div className="pt-4">
          <input type="hidden" name="latitude" value={latitude || ""} />
          <input type="hidden" name="longitude" value={longitude || ""} />

          <button
            type="submit"
            disabled={isSubmitting || fetcher.state === "loading"}
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-3 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "제출 중..." : "추천하기"}
          </button>
        </div>
      </fetcher.Form>
    </div>
  );
}
