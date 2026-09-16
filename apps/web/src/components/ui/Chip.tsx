import type { ButtonHTMLAttributes } from "react";

export function Chip({
  selected = false,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={
        "inline-flex h-11 items-center gap-2 rounded-full px-[18px] text-[15px] transition " +
        (selected
          ? "border border-brass bg-brass-wash text-ink"
          : "border border-linen text-ink hover:border-brass") +
        " " +
        className
      }
      {...rest}
    >
      {selected && (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-brass-deep">
          <path d="M3 8.5 L6.5 12 L13 4.5" />
        </svg>
      )}
      {children}
    </button>
  );
}
