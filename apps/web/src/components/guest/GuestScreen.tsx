// The shared shell for every full-page guest screen before the itinerary
// itself (offer, questionnaire, crafting). Each of those was rendering its
// own `min-h-screen max-w-md` card with nothing around it — fine on a phone,
// but on a laptop-width window that leaves a narrow strip of content pinned
// to the left of a lot of empty ivory. This centers the card in both axes on
// a filled backdrop and caps its height so nothing ever needs the browser's
// own scroll on a normal laptop screen — the card scrolls internally if it
// ever has to.
export function GuestScreen({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sand px-4 py-6">
      <div className="flex max-h-[min(760px,92vh)] w-full max-w-[420px] flex-col overflow-y-auto rounded-lg border border-linen bg-ivory shadow-card">
        {children}
      </div>
    </main>
  );
}
