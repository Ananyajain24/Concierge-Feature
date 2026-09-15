import { api } from "@/lib/api";
import type { Booking, Poi, Villa, Itinerary } from "@lohono/shared-types";
import { ReviewWorkspace } from "./ReviewWorkspace";

export const dynamic = "force-dynamic";

interface Detail {
  itinerary: Itinerary;
  booking: Booking;
  villa: Villa;
  pois: Poi[];
}

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await api<Detail>(`/review/${id}`);
  return <ReviewWorkspace detail={detail} />;
}
