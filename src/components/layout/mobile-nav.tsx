import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Leaf, CloudSun, Bot, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { url: "/dashboard", label: "Home", icon: LayoutDashboard },
  { url: "/crop-health", label: "Crops", icon: Leaf },
  { url: "/weather", label: "Weather", icon: CloudSun },
  { url: "/assistant", label: "AI", icon: Bot },
  { url: "/settings", label: "Settings", icon: Settings },
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
