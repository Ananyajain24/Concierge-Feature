import { api } from "@/lib/api";
import { QuestionnaireFlow } from "./QuestionnaireFlow";
import type { Booking } from "@lohono/shared-types";

export const dynamic = "force-dynamic";

export default async function QuestionnairePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await api<{ booking: Booking; preferences: unknown }>(
    `/questionnaire/${token}`,
  ).catch(() => null);
  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-graphite">This questionnaire link isn&apos;t valid.</p>
      </main>
    );
  }
  return <QuestionnaireFlow token={token} booking={data.booking} />;
}
