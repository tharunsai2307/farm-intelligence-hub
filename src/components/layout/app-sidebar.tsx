import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Boxes,
  Leaf,
  CloudSun,
  Droplets,
  LineChart,
  Tractor,
  ShoppingBag,
  FileBarChart2,
  Bot,
  Settings,
  Sprout,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export const NAV_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, group: "Overview" },
  { title: "Digital Twin", url: "/digital-twin", icon: Boxes, group: "Intelligence" },
  { title: "Crop Health", url: "/crop-health", icon: Leaf, group: "Intelligence" },
  { title: "Weather", url: "/weather", icon: CloudSun, group: "Intelligence" },
  { title: "Irrigation", url: "/irrigation", icon: Droplets, group: "Intelligence" },
  { title: "Yield Prediction", url: "/yield-prediction", icon: LineChart, group: "Intelligence" },
  { title: "FarmOS", url: "/farmos", icon: Tractor, group: "Operations" },
  { title: "Marketplace", url: "/marketplace", icon: ShoppingBag, group: "Operations" },
  { title: "Reports", url: "/reports", icon: FileBarChart2, group: "Operations" },
  { title: "AI Assistant", url: "/assistant", icon: Bot, group: "Operations" },
  { title: "Settings", url: "/settings", icon: Settings, group: "Account" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

const GROUPS = ["Overview", "Intelligence", "Operations", "Account"] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-brand text-primary-foreground">
            <Sprout className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold">AgriTwin OS</span>
            <span className="truncate text-xs text-muted-foreground">Farm Intelligence</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.filter((i) => i.group === group).map((item) => {
                  const active = pathname === item.url || pathname.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          v0.1 · Phase 1
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
