import { Link } from "@tanstack/react-router";
import { Bell, AlertTriangle, Boxes, Wrench, Sprout, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import type { FarmOSDashboard } from "@/lib/services/farmos.server";

interface Notice {
  kind: "low_stock" | "expired" | "task_due" | "maintenance" | "harvest";
  message: string;
  href: string;
}

export function FarmOSNotificationPanel({ data }: { data: FarmOSDashboard }) {
  const notices: Notice[] = [];

  for (const t of data.today_tasks ?? []) {
    notices.push({ kind: "task_due", message: `Task due: ${t.title}`, href: "/app/farmos/tasks" });
  }
  for (const i of data.low_stock ?? []) {
    if (i.alerts.includes("expired")) notices.push({ kind: "expired", message: `${i.name} has expired`, href: "/app/farmos/inventory" });
    else if (i.alerts.includes("out_of_stock")) notices.push({ kind: "low_stock", message: `${i.name} is out of stock`, href: "/app/farmos/inventory" });
    else if (i.alerts.includes("low_stock")) notices.push({ kind: "low_stock", message: `${i.name} is low (${Number(i.quantity)} ${i.unit})`, href: "/app/farmos/inventory" });
    else if (i.alerts.includes("expiring_soon")) notices.push({ kind: "expired", message: `${i.name} expires on ${i.expiry_date}`, href: "/app/farmos/inventory" });
  }
  for (const e of data.maintenance_due ?? []) {
    notices.push({ kind: "maintenance", message: `Maintenance: ${e.name}${e.next_maintenance_date ? ` by ${e.next_maintenance_date}` : ""}`, href: "/app/farmos/equipment" });
  }
  for (const h of data.upcoming_harvest ?? []) {
    notices.push({ kind: "harvest", message: `Harvest: ${h.crop} on ${h.expected_harvest_date}`, href: "/app/farmos/harvest" });
  }

  if (notices.length === 0) {
    return <EmptyState icon={Bell} title="No alerts" description="All operations look good. Alerts will appear from real events." />;
  }

  const iconFor = (k: Notice["kind"]) => {
    if (k === "task_due") return ClipboardList;
    if (k === "maintenance") return Wrench;
    if (k === "harvest") return Sprout;
    if (k === "expired") return AlertTriangle;
    return Boxes;
  };
  const toneFor = (k: Notice["kind"]) => {
    if (k === "expired") return "text-destructive";
    if (k === "low_stock") return "text-amber-500";
    if (k === "maintenance") return "text-amber-500";
    if (k === "harvest") return "text-emerald-500";
    return "text-primary";
  };

  return (
    <ul className="surface-card divide-y">
      {notices.slice(0, 30).map((n, i) => {
        const Icon = iconFor(n.kind);
        return (
          <li key={i} className="flex items-center gap-3 p-3">
            <Icon className={`h-4 w-4 ${toneFor(n.kind)}`} />
            <span className="flex-1 text-sm">{n.message}</span>
            <Link to={n.href} className="text-xs text-primary underline">View</Link>
          </li>
        );
      })}
      <li className="flex items-center justify-between gap-3 p-2 text-xs text-muted-foreground">
        <span>{notices.length} live alerts derived from your data</span>
        <Badge variant="outline" className="text-[10px]">No fake reminders</Badge>
      </li>
    </ul>
  );
}
