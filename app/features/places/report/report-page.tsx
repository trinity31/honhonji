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
import { useState } from "react";

import { Badge } from "~/core/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "~/core/components/ui/radio-group";
import { Label } from "~/core/components/ui/label";
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

type PlaceType = 'restaurant' | 'walking_trail';

export default function ReportPlacePage({ loaderData }: Route.ComponentProps) {
  const [selectedTags, setSelectedTags] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [placeType, setPlaceType] = useState<PlaceType>('restaurant');
  const { tags } = loaderData;

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
      <h1 className="mb-8 text-2xl font-bold">새로운 장소 제보</h1>

      <form className="space-y-6">
        {/* 장소명 */}
        <div>
          <label htmlFor="placeName" className="mb-2 block font-medium">
            장소명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="placeName"
            name="placeName"
            required
            className="w-full rounded-md border p-2"
            placeholder="예) 맛있는 집"
          />
        </div>

        {/* 장소 타입 선택 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">장소 타입</Label>
          <RadioGroup 
            defaultValue="restaurant" 
            className="flex space-x-4"
            value={placeType}
            onValueChange={(value: PlaceType) => setPlaceType(value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="restaurant" id="restaurant" />
              <Label htmlFor="restaurant">
                식당
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="walking_trail" id="walking_trail" />
              <Label htmlFor="walking_trail">
                산책로
              </Label>
            </div>
          </RadioGroup>
          <input type="hidden" name="placeType" value={placeType} />
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
            주소 <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="address"
              name="address"
              readOnly
              className="flex-1 rounded-md border p-2"
              placeholder="주소 검색 버튼을 눌러주세요"
            />
            <button
              type="button"
              className="rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                // TODO: 주소 검색 기능 구현
                alert("주소 검색 기능이 곧 추가될 예정입니다.");
              }}
            >
              주소 검색
            </button>
          </div>
        </div>

        {/* 상세 주소 */}
        <div>
          <label htmlFor="detailAddress" className="mb-2 block font-medium">
            상세 주소
          </label>
          <input
            type="text"
            id="detailAddress"
            name="detailAddress"
            className="w-full rounded-md border p-2"
            placeholder="상세 주소를 입력해주세요"
          />
        </div>

        {/* 제보 내용 */}
        <div>
          <label htmlFor="content" className="mb-2 block font-medium">
            제보 내용
          </label>
          <textarea
            id="content"
            name="content"
            rows={4}
            className="w-full rounded-md border p-2"
            placeholder="이 장소에 대한 간단한 설명이나 추천 이유를 적어주세요"
          ></textarea>
        </div>

        {/* 제출 버튼 */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            제보하기
          </button>
        </div>
      </form>
    </div>
  );
}
