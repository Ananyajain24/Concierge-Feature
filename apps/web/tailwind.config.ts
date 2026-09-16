import type { Config } from "tailwindcss";

// Every colour resolves to a custom property declared in src/lib/tokens.css.
// That file is the only place a hex may appear.
const c = (name: string) => `rgb(var(--l-${name}-rgb) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: c("ivory"),
        sand: c("sand"),
        linen: c("linen"),
        "linen-warm": c("linen-warm"),
        ink: c("ink"),
        graphite: c("graphite"),
        muted: c("muted"),
        brass: c("brass"),
        "brass-deep": c("brass-deep"),
        "brass-hover": c("brass-hover"),
        "brass-wash": c("brass-wash"),
        forest: c("forest"),
        sage: c("sage"),
        terracotta: c("terracotta"),
        amber: c("amber"),
        crimson: c("crimson"),
        "sage-tint": c("sage-tint"),
        "sage-ink": c("sage-ink"),
        "sage-edge": c("sage-edge"),
        "amber-tint": c("amber-tint"),
        "amber-edge": c("amber-edge"),
        "crimson-edge": c("crimson-edge"),
        sea: c("sea"),
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        sheet: "var(--shadow-sheet)",
        pop: "var(--shadow-pop)",
      },
      letterSpacing: {
        eyebrow: "0.14em",
      },
    },
  },
  plugins: [],
};
export default config;
