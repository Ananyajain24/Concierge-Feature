"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

// A small bottom-sheet composer, reused wherever a guest sends the concierge
// free text: the "message your concierge" rail, the "ask about it" upsell
// card. `onSend` does the actual network call — callers differ in where the
// message ends up (an itinerary re-enters review vs. a pre-generation note).
export function MessageSheet({
  title,
  placeholder,
  initialValue = "",
  onSend,
  onClose,
}: {
  title: string;
  placeholder: string;
  initialValue?: string;
  onSend: (message: string) => Promise<void>;
  onClose: () => void;
}) {
  const [message, setMessage] = useState(initialValue);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    try {
      await onSend(message.trim());
    } catch (e) {
      setError((e as Error).message);
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-[420px] rounded-t-lg bg-ivory p-6 shadow-sheet sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-[22px] leading-tight">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-linen hover:bg-sand"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M4 4 L12 12 M12 4 L4 12" />
            </svg>
          </button>
        </div>

        <textarea
          autoFocus
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="mt-4 w-full rounded-sm border border-linen bg-ivory px-3.5 py-3 text-[14px] outline-none focus:border-brass focus:ring-2 focus:ring-brass/30"
        />
        {error && <p className="mt-2 text-[13px] text-terracotta">{error}</p>}

        <div className="mt-4 flex gap-3">
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button size="lg" className="grow" disabled={!message.trim() || sending} onClick={submit}>
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
