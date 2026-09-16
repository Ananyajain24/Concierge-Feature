import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:opacity-40 disabled:cursor-not-allowed";

const VARIANT: Record<Variant, string> = {
  primary: "bg-brass-deep text-ivory hover:bg-brass-hover",
  secondary: "border border-linen text-ink hover:bg-sand",
  ghost: "text-graphite hover:text-ink",
  danger: "border border-terracotta text-terracotta hover:bg-brass-wash",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  const dims =
    size === "lg" ? "h-[52px] px-6 text-[15px]" : size === "sm" ? "h-9 px-4 text-[13px]" : "h-11 px-6 text-sm";
  return <button className={`${BASE} ${VARIANT[variant]} ${dims} ${className}`} {...rest} />;
}
