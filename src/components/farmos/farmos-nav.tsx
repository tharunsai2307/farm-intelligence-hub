import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Boxes, Wrench, Users, ClipboardList, Receipt, Sprout, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export const FARMOS_TABS = [
  { href: "/app/farmos", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/app/farmos/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/app/farmos/inventory", label: "Inventory", icon: Boxes },
  { href: "/app/farmos/equipment", label: "Equipment", icon: Wrench },
  { href: "/app/farmos/workers", label: "Workers", icon: Users },
  { href: "/app/farmos/expenses", label: "Expenses", icon: Receipt },
  { href: "/app/farmos/harvest", label: "Harvest", icon: Sprout },
  { href: "/app/farmos/calendar", label: "Calendar", icon: CalendarDays },
] as const;

export function FarmOSNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="surface-card mb-6 flex flex-wrap gap-1 p-1">
      {FARMOS_TABS.map((t) => {
        const active = t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            to={t.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <t.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
