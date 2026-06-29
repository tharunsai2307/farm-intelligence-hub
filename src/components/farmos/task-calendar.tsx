import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, ClipboardList, Sprout, Wrench, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CalendarItem } from "@/lib/services/farmos.server";

const KIND_ICON = {
  task: ClipboardList,
  harvest: Sprout,
  maintenance: Wrench,
  event: Star,
} as const;

const KIND_TONE: Record<CalendarItem["kind"], string> = {
  task: "bg-primary/15 text-primary",
  harvest: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  maintenance: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  event: "bg-muted text-muted-foreground",
};

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function ymd(d: Date) { return d.toISOString().slice(0, 10); }

export function TaskCalendar({
  items,
  month,
  onMonthChange,
}: {
  items: CalendarItem[];
  month: Date;
  onMonthChange: (d: Date) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const grid = useMemo(() => {
    const first = startOfMonth(month);
    const last = endOfMonth(month);
    const startDow = first.getDay();
    const days: Date[] = [];
    for (let i = 0; i < startDow; i++) days.push(new Date(first.getFullYear(), first.getMonth(), i - startDow + 1));
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(first.getFullYear(), first.getMonth(), d));
    while (days.length % 7 !== 0) days.push(new Date(first.getFullYear(), first.getMonth() + 1, days.length - last.getDate() - startDow + 1));
    return days;
  }, [month]);

  const byDay = useMemo(() => {
    const m = new Map<string, CalendarItem[]>();
    for (const it of items) {
      const key = it.starts_at.slice(0, 10);
      const arr = m.get(key) ?? [];
      arr.push(it);
      m.set(key, arr);
    }
    return m;
  }, [items]);

  const selectedItems = selected ? byDay.get(selected) ?? [] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{month.toLocaleString(undefined, { month: "long", year: "numeric" })}</h2>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="outline" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onMonthChange(new Date())}>Today</Button>
          <Button size="icon" variant="outline" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="grid grid-cols-7 border-b text-center text-[11px] font-semibold uppercase text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((d) => {
            const inMonth = d.getMonth() === month.getMonth();
            const key = ymd(d);
            const dayItems = byDay.get(key) ?? [];
            const isToday = ymd(new Date()) === key;
            return (
              <button
                key={key + d.getTime()}
                onClick={() => setSelected(key)}
                className={`min-h-[88px] border-b border-r p-1 text-left text-xs transition hover:bg-accent ${
                  inMonth ? "" : "bg-muted/30 text-muted-foreground"
                } ${selected === key ? "ring-2 ring-primary ring-inset" : ""}`}
              >
                <div className={`mb-1 inline-block rounded px-1 ${isToday ? "bg-primary text-primary-foreground" : ""}`}>{d.getDate()}</div>
                <div className="flex flex-wrap gap-1">
                  {dayItems.slice(0, 3).map((it) => {
                    const Icon = KIND_ICON[it.kind];
                    return (
                      <span key={it.id} className={`inline-flex max-w-full items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] ${KIND_TONE[it.kind]}`} title={it.title}>
                        <Icon className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{it.title}</span>
                      </span>
                    );
                  })}
                  {dayItems.length > 3 && <span className="text-[10px] text-muted-foreground">+{dayItems.length - 3}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="surface-card p-4">
          <h3 className="mb-2 text-sm font-semibold">{new Date(selected).toLocaleDateString(undefined, { dateStyle: "full" })}</h3>
          {selectedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events on this day.</p>
          ) : (
            <ul className="space-y-2">
              {selectedItems.map((it) => {
                const Icon = KIND_ICON[it.kind];
                return (
                  <li key={it.id} className="flex items-center gap-3 rounded-md border p-2">
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${KIND_TONE[it.kind]}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{it.title}</p>
                      <p className="text-xs capitalize text-muted-foreground">{it.kind}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{new Date(it.starts_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
