export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <p className="uppercase tracking-widest text-xs text-forest">Lohono</p>
      <h1 className="mt-3 font-display text-5xl text-ink">Concierge</h1>
      <p className="mt-6 max-w-md text-ink/70">
        A skeleton — Milestone 0 stands up. Real product surfaces land in
        M1–M7.
      </p>
      <a
        href="/dev/map"
        className="mt-8 inline-flex rounded-full border border-ink px-6 py-2 text-sm hover:bg-ink hover:text-sand"
      >
        Dev sandbox
      </a>
    </main>
  );
}
