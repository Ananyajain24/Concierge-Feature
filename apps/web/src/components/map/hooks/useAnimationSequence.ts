"use client";

import { useEffect, useState, type RefObject } from "react";

export type SequenceStep = "artwork" | "villa" | "pins" | "routes" | "labels";

const STEPS: SequenceStep[] = ["artwork", "villa", "pins", "routes", "labels"];
const TIMINGS: Record<SequenceStep, number> = {
  artwork: 0,
  villa: 250,
  pins: 500,
  routes: 900,
  labels: 1800,
};

// Triggers animation stages once the ref enters the viewport.
// Honors prefers-reduced-motion. Exposes a skip() that jumps to the final stage.
export function useAnimationSequence(ref: RefObject<HTMLElement | null>) {
  const [stage, setStage] = useState<SequenceStep | "done" | "idle">("idle");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(m.matches);
    const cb = () => setReduced(m.matches);
    m.addEventListener?.("change", cb);
    return () => m.removeEventListener?.("change", cb);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (reduced) {
              setStage("done");
            } else {
              setStage("artwork");
              for (const s of STEPS) {
                setTimeout(() => setStage(s), TIMINGS[s]);
              }
              setTimeout(() => setStage("done"), TIMINGS.labels + 400);
            }
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, reduced]);

  const skip = () => setStage("done");

  const isVisible = (s: SequenceStep) => {
    if (stage === "done") return true;
    if (stage === "idle") return false;
    return STEPS.indexOf(stage) >= STEPS.indexOf(s);
  };

  return { stage, isVisible, skip, reduced };
}
