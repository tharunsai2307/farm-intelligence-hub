import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Boxes, MapPinned, FlaskConical, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { url: "/app/dashboard", label: "Home", icon: LayoutDashboard },
  { url: "/app/digital-twin", label: "Twin", icon: Boxes },
  { url: "/app/farm/plots", label: "Plots", icon: MapPinned },
  { url: "/app/farm/records", label: "Records", icon: FlaskConical },
  { url: "/app/settings", label: "Settings", icon: Settings },
] as const;

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur md:hidden"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = pathname === item.url || pathname.startsWith(item.url + "/");
          return (
            <li key={item.url}>
              <Link
                to={item.url}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 text-xs",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
