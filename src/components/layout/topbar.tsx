import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, ChevronRight, LogOut, Search, User2, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { signOutCleanly } from "@/lib/auth-actions";
import { NAV_ITEMS } from "./app-sidebar";
import { listNotifications } from "@/lib/services/notifications.functions";

function useBreadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((seg, i) => ({
    label: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + parts.slice(0, i + 1).join("/"),
    last: i === parts.length - 1,
  }));
}

export function Topbar() {
  const crumbs = useBreadcrumbs();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const initials =
    (user?.user_metadata?.full_name as string | undefined)
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("") ??
    user?.email?.[0]?.toUpperCase() ??
    "U";

  const handleSignOut = async () => {
    await signOutCleanly(queryClient);
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="flex w-full min-w-0 items-center gap-3">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="hidden min-w-0 items-center gap-1 text-sm text-muted-foreground md:flex"
      >
        {crumbs.map((c, i) => (
          <span key={c.href} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
            {c.last ? (
              <span className="truncate font-medium text-foreground">{c.label}</span>
            ) : (
              <Link to={c.href} className="truncate hover:text-foreground">
                {c.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <GlobalSearch />
        <NotificationsBell />
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Account menu">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.user_metadata?.avatar_url as string | undefined} alt="" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">{user?.email ?? "Account"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/app/settings">
                <User2 className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/app/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const navigate = useNavigate();
  const matches = (q: string) =>
    NAV_ITEMS.filter((i) => i.title.toLowerCase().includes(q.toLowerCase())).slice(0, 6);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 w-64 justify-start gap-2 text-muted-foreground sm:flex"
        >
          <Search className="h-4 w-4" />
          <span className="truncate">Search…</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="end">
        <SearchInner onSelect={(url) => navigate({ to: url })} matches={matches} />
      </PopoverContent>
    </Popover>
  );
}

function SearchInner({
  matches,
  onSelect,
}: {
  matches: (q: string) => ReadonlyArray<(typeof NAV_ITEMS)[number]>;
  onSelect: (url: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Input
        autoFocus
        placeholder="Search modules…"
        id="topbar-search"
        onChange={(e) => {
          const list = document.getElementById("topbar-search-results");
          if (!list) return;
          list.innerHTML = "";
          for (const m of matches(e.target.value)) {
            const btn = document.createElement("button");
            btn.className =
              "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent";
            btn.textContent = m.title;
            btn.onclick = () => onSelect(m.url);
            list.appendChild(btn);
          }
        }}
      />
      <div id="topbar-search-results" className="space-y-1" />
      <p className="px-2 text-xs text-muted-foreground">Type to filter modules.</p>
    </div>
  );
}

function NotificationsBell() {
  const { data } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => listNotifications({ data: { limit: 10 } }),
    staleTime: 30_000,
  });
  const items = data?.items ?? [];
  const unread = items.filter((n) => !n.read_at).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px]">
              {unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3 text-sm font-medium">Notifications</div>
        <div className="max-h-80 overflow-auto">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              You're all caught up.
            </div>
          ) : (
            items.map((n) => (
              <div key={n.id} className="border-b px-4 py-3 last:border-b-0">
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
