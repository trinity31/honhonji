// import { useLoaderData } from '@remix-run/react';
// import { json, type LoaderFunctionArgs } from '@remix-run/node';
import type { Route } from "../../map/+types/map-page";

export const loader = async ({ request }: Route.LoaderArgs) => {
  // TODO: 실제 데이터 페칭 로직 추가
  return { places: [] };
};

export default function MapsPage({ loaderData }: Route.ComponentProps) {
  const { places } = loaderData;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">혼밥 지도</h1>
      <div className="bg-card rounded-lg border p-6">
        <div className="bg-muted flex h-[600px] w-full items-center justify-center rounded-lg">
          <p className="text-muted-foreground">지도가 여기에 표시됩니다.</p>
        </div>

        {/* 식당 목록 */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">주변 식당</h2>
          {places.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {places.map((place: any) => (
                <div
                  key={place.id}
                  className="hover:bg-accent/50 cursor-pointer rounded-lg border p-4 transition-colors"
                >
                  <h3 className="font-medium">{place.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {place.address}
                  </p>
                  <div className="mt-2">
                    <span className="bg-primary/10 text-primary rounded px-2 py-1 text-sm">
                      {place.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">
              주변에 등록된 식당이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
