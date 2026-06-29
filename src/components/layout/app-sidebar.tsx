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
  MapPin,
  FlaskConical,
  MapPinned,
  Radio,
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
import { Badge } from "@/components/ui/badge";

export const NAV_ITEMS = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard, group: "Overview", ready: true },
  { title: "Digital Twin", url: "/app/digital-twin", icon: Boxes, group: "Overview", ready: true },
  { title: "AgriSense", url: "/app/agrisense", icon: Radio, group: "Overview", ready: true },
  { title: "Farm Plots", url: "/app/farm/plots", icon: MapPinned, group: "My Farm", ready: true },
  { title: "Location", url: "/app/farm/location", icon: MapPin, group: "My Farm", ready: true },
  { title: "Records", url: "/app/farm/records", icon: FlaskConical, group: "My Farm", ready: true },
  { title: "Crop Health", url: "/app/crop-health", icon: Leaf, group: "Intelligence", ready: true },
  { title: "Weather", url: "/app/weather", icon: CloudSun, group: "Intelligence", ready: true },
  { title: "Irrigation", url: "/app/irrigation", icon: Droplets, group: "Intelligence", ready: true },
  { title: "Yield Prediction", url: "/app/yield-prediction", icon: LineChart, group: "Intelligence", ready: false },
  { title: "FarmOS", url: "/app/farmos", icon: Tractor, group: "Operations", ready: true },
  { title: "Marketplace", url: "/app/marketplace", icon: ShoppingBag, group: "Operations", ready: true },
  { title: "Reports", url: "/app/reports", icon: FileBarChart2, group: "Operations", ready: true },
  { title: "AgriMind AI", url: "/app/agrimind", icon: Bot, group: "Intelligence", ready: true },
  { title: "Settings", url: "/app/settings", icon: Settings, group: "Account", ready: true },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

const GROUPS = ["Overview", "My Farm", "Intelligence", "Operations", "Account"] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader>
        <Link to="/app/dashboard" className="flex items-center gap-2 px-2 py-2">
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
                          <span className="flex-1 truncate">{item.title}</span>
                          {!item.ready && (
                            <Badge
                              variant="outline"
                              className="ml-auto h-4 px-1.5 text-[9px] font-normal text-muted-foreground group-data-[collapsible=icon]:hidden"
                            >
                              Soon
                            </Badge>
                          )}
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
          v0.2 · Phase 1
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
