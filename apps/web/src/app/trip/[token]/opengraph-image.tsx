import { ImageResponse } from "next/og";
import { api } from "@/lib/api";
import type { PublishedSnapshot } from "@lohono/shared-types";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Trip {
  snapshot: PublishedSnapshot;
  version: number;
}

export default async function OGImage({ params }: { params: { token: string } }) {
  const trip = await api<Trip>(`/trip/${params.token}`).catch(() => null);
  const villa = trip?.snapshot.villa.name ?? "Your Villa";
  const dates =
    trip?.snapshot.dates
      ? `${trip.snapshot.dates.checkIn} → ${trip.snapshot.dates.checkOut}`
      : "";
  const summary = trip?.snapshot.summary ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: 80,
          background: "#f4ecdf",
          color: "#1f1d1a",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: "#3d5a4d" }}>
          Lohono Concierge
        </div>
        <div style={{ fontSize: 72, marginTop: 20, fontWeight: 600 }}>{villa}</div>
        <div style={{ fontSize: 28, marginTop: 16, color: "#666" }}>{dates}</div>
        {summary && (
          <div style={{ fontSize: 24, marginTop: 40, color: "#333", maxWidth: 900, lineHeight: 1.3 }}>
            {summary}
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
