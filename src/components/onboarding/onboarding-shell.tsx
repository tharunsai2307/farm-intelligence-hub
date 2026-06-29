import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StepIndicator({
  steps,
  current,
}: {
  steps: ReadonlyArray<{ id: string; label: string }>;
  current: string;
}) {
  const currentIdx = steps.findIndex((s) => s.id === current);
  return (
    <ol className="flex items-center gap-3">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={s.id} className="flex items-center gap-3">
            <div
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full text-xs font-medium ring-1 ring-border",
                done && "bg-primary text-primary-foreground ring-primary",
                active && "bg-foreground text-background ring-foreground",
                !done && !active && "bg-muted text-muted-foreground",
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                active ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="h-px w-6 bg-border" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <header>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </header>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function OnboardingShell({
  title,
  subtitle,
  steps,
  current,
  children,
}: {
  title: string;
  subtitle?: string;
  steps: ReadonlyArray<{ id: string; label: string }>;
  current: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 flex flex-col gap-4">
        <StepIndicator steps={steps} current={current} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="surface-card p-6 sm:p-8">{children}</div>
    </div>
  );
}

export const ONBOARDING_STEPS = [
  { id: "profile", label: "Profile" },
  { id: "farm", label: "Farm" },
] as const;
