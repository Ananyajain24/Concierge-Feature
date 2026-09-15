"use client";

interface Props {
  dayCount: number;
  activeDay: number | null;
  onChange: (day: number | null) => void;
}

export function DayFilter({ dayCount, activeDay, onChange }: Props) {
  return (
    <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-1.5 rounded-full bg-white/85 p-1 shadow-sm backdrop-blur">
      <button
        onClick={() => onChange(null)}
        className={
          "rounded-full px-3 py-1 text-xs transition " +
          (activeDay == null ? "bg-ink text-sand" : "text-ink/70 hover:bg-ink/5")
        }
      >
        All
      </button>
      {Array.from({ length: dayCount }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={
            "rounded-full px-3 py-1 text-xs transition " +
            (activeDay === i ? "bg-ink text-sand" : "text-ink/70 hover:bg-ink/5")
          }
        >
          Day {i + 1}
        </button>
      ))}
    </div>
  );
}
