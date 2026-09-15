// One sprite of category glyphs, referenced by <use href="#icon-…"/>.
// Adding a category later means one <symbol/> here and one map entry.

export const CATEGORY_COLOR: Record<string, string> = {
  beach: "#e0a35a",
  restaurant: "#c15b3d",
  bar: "#8f4a89",
  heritage: "#7a5f3d",
  market: "#5b8f5b",
  spa: "#5b8fa1",
  watersport: "#4a7ba6",
  cafe: "#a67b4a",
  sunset_point: "#e07a5f",
  day_trip: "#3d5a4d",
  villa: "#1f1d1a",
  default: "#4a4a4a",
};

export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <symbol id="icon-beach" viewBox="0 0 20 20">
          <path d="M4 14h12l-2 3H6z" fill="currentColor"/>
          <circle cx="10" cy="9" r="2.5" fill="currentColor"/>
          <path d="M10 9 L4 6 M10 9 L16 6 M10 9 L7 3 M10 9 L13 3" stroke="currentColor" strokeWidth="1.2"/>
        </symbol>
        <symbol id="icon-restaurant" viewBox="0 0 20 20">
          <path d="M6 3v6M8 3v6M6 9h2v8H6zM12 3v14M12 8c2 0 3-2 3-4V3" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        </symbol>
        <symbol id="icon-bar" viewBox="0 0 20 20">
          <path d="M4 3h12L11 11v5h2v1H7v-1h2v-5z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        </symbol>
        <symbol id="icon-heritage" viewBox="0 0 20 20">
          <path d="M3 17h14M4 17V9l6-4 6 4v8M8 17v-4h4v4" stroke="currentColor" strokeWidth="1.3" fill="none"/>
        </symbol>
        <symbol id="icon-market" viewBox="0 0 20 20">
          <path d="M3 7h14l-1 8H4z M6 7V4h8v3" stroke="currentColor" strokeWidth="1.3" fill="none"/>
        </symbol>
        <symbol id="icon-spa" viewBox="0 0 20 20">
          <path d="M10 4c-3 3-3 8 0 12 3-4 3-9 0-12z M4 10c3 0 6 2 6 6 0-4 3-6 6-6" stroke="currentColor" strokeWidth="1.3" fill="none"/>
        </symbol>
        <symbol id="icon-watersport" viewBox="0 0 20 20">
          <path d="M2 13c2 1 3-1 5 0s3 1 5 0 3-1 5 0" stroke="currentColor" strokeWidth="1.4" fill="none"/>
          <path d="M6 10l4-6 4 6" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        </symbol>
        <symbol id="icon-cafe" viewBox="0 0 20 20">
          <path d="M4 8h11v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM15 9h2a2 2 0 0 1 0 4h-2" stroke="currentColor" strokeWidth="1.3" fill="none"/>
          <path d="M7 3v2M10 3v2M13 3v2" stroke="currentColor" strokeWidth="1.3"/>
        </symbol>
        <symbol id="icon-sunset_point" viewBox="0 0 20 20">
          <circle cx="10" cy="12" r="4" fill="currentColor"/>
          <path d="M2 16h16" stroke="currentColor" strokeWidth="1.4"/>
        </symbol>
        <symbol id="icon-day_trip" viewBox="0 0 20 20">
          <path d="M10 3l2 5h5l-4 3 2 6-5-4-5 4 2-6-4-3h5z" stroke="currentColor" strokeWidth="1.3" fill="none"/>
        </symbol>
        <symbol id="icon-villa" viewBox="0 0 20 20">
          <path d="M3 10l7-6 7 6v8H3z M8 18v-5h4v5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
        </symbol>
      </defs>
    </svg>
  );
}

export function categoryColor(category: string): string {
  return CATEGORY_COLOR[category] ?? CATEGORY_COLOR.default!;
}
