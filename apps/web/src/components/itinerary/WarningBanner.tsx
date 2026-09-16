import { WARNING_COPY, type WarningCode } from "@lohono/shared-types";

const TRIANGLE = (
  <path d="M8 2.5 L14.5 13.5 L1.5 13.5 Z M8 6.5 V9.5 M8 11.4 V11.5" />
);
const CLOCK = <path d="M8 1.5 a6.5 6.5 0 1 0 0 13 a6.5 6.5 0 1 0 0 -13 M8 4.5 V8 L10.2 9.6" />;

// Advisory, never blocking, never red. One line per code.
export function WarningBanner({ codes }: { codes: string[] }) {
  if (codes.length === 0) return null;
  return (
    <div className="mt-3.5 flex flex-col gap-2">
      {codes.map((code) => (
        <div
          key={code}
          className="flex items-start gap-2.5 rounded-r-lg border-l-[3px] border-terracotta bg-brass-wash px-3.5 py-2.5"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0 text-terracotta"
          >
            {code === "CLOSED_TODAY" ? CLOCK : TRIANGLE}
          </svg>
          <span className="text-[13px] leading-snug text-graphite">
            {WARNING_COPY[code as WarningCode] ?? code}
          </span>
        </div>
      ))}
    </div>
  );
}
