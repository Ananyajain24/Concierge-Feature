// The "visit their website" option needs somewhere real to send the guest.
// No POI in the catalog carries a real partner booking URL yet (bookingUrl
// is null on every seed row), so rather than fabricate a fake business page,
// this opens a genuine search that will surface the place's actual site —
// honest, functional, and it doesn't pretend to know a URL we don't have.
export function externalSearchUrl(name: string, context?: string | null): string {
  const q = context ? `${name} ${context} book a table` : `${name} book online`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}
