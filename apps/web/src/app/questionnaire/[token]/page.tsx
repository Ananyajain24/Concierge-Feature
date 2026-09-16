import { api } from "@/lib/api";
import { QuestionnaireFlow } from "./QuestionnaireFlow";
import type { Readiness } from "./ItineraryOffer";
import type { Booking, Destination, Villa } from "@lohono/shared-types";

export const dynamic = "force-dynamic";

interface QuestionnaireContext {
  booking: Booking;
  preferences: unknown;
  villa: Villa | null;
  destination: Destination | null;
  readiness: Readiness | null;
}

export default async function QuestionnairePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await api<QuestionnaireContext>(`/questionnaire/${token}`).catch(() => null);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-graphite">This questionnaire link isn&apos;t valid.</p>
      </main>
    );
  }

  if (!data.villa || !data.destination || !data.readiness) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-graphite">We couldn&apos;t find the villa for this booking.</p>
      </main>
    );
  }

  return (
    <QuestionnaireFlow
      token={token}
      booking={data.booking}
      villa={data.villa}
      destination={data.destination}
      readiness={data.readiness}
    />
  );
}
