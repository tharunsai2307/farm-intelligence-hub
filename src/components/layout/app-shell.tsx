import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="md:hidden" />
            <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
            <Topbar />
          </header>
          <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>
          <MobileNav />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
