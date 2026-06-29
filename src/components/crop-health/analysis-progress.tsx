import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const STEPS = [
  "Uploading image",
  "Preparing AI model",
  "Analyzing crop",
  "Generating diagnosis",
  "Saving report",
];

export function AnalysisProgress({ active }: { active: boolean }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!active) {
      setIdx(0);
      return;
    }
    const t = setInterval(() => {
      setIdx((i) => Math.min(i + 1, STEPS.length - 1));
    }, 1200);
    return () => clearInterval(t);
  }, [active]);

  if (!active) return null;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm font-medium">Analyzing your crop…</span>
      </div>
      <ol className="space-y-2">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`flex items-center gap-2 text-sm transition ${
              i <= idx ? "text-foreground" : "text-muted-foreground/60"
            }`}
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                i < idx ? "bg-primary" : i === idx ? "bg-primary animate-pulse" : "bg-muted"
              }`}
            />
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}
