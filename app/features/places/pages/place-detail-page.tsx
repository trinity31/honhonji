import type { Route } from "./+types/place-detail-page";
import { useParams } from "react-router";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Place Details" },
    { name: "description", content: "Details for the selected place." },
  ];
};

export default function PlaceDetailPage({}: Route.ComponentProps) {
  const { placeId } = useParams<{ placeId: string }>();

  return (
    <div>
      <h1>Place Detail Page</h1>
      <p>Place ID: {placeId}</p>
    </div>
  );
}
