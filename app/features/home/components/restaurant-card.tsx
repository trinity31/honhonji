import { Button } from "~/core/components/ui/button";
import { Card, CardContent } from "~/core/components/ui/card";

export interface Restaurant {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onViewDetails?: () => void;
}

export function RestaurantCard({
  restaurant,
  onViewDetails,
}: RestaurantCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-md">
          <img
            src={restaurant.image_url || "/images/default-restaurant.png"}
            alt={restaurant.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/default-restaurant.png";
            }}
          />
        </div>
        <h3 className="text-lg font-semibold">{restaurant.name}</h3>
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {restaurant.description}
        </p>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 mt-3 w-full"
          onClick={onViewDetails}
        >
          자세히 보기
        </Button>
      </CardContent>
    </Card>
  );
}

export default RestaurantCard;
