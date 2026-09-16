export function formatInr(paise: number | null | undefined): string {
  if (paise == null) return "Price on request";
  return `₹${paise.toLocaleString("en-IN")}`;
}
