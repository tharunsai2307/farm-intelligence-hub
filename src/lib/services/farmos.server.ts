/**
 * FarmOS — server-side data layer for inventory, equipment, workers,
 * worker attendance, tasks, expenses, harvest records, and calendar events.
 *
 * Every read/write is scoped to the authenticated user via RLS. No values
 * are fabricated. Alerts are derived purely from stored data.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { fail, ok, type ServiceResult } from "./result";

type SB = SupabaseClient<Database>;

// ----------- Row types -----------
export type InventoryRow = Database["public"]["Tables"]["inventory_items"]["Row"];
export type EquipmentRow = Database["public"]["Tables"]["equipment"]["Row"];
export type WorkerRow = Database["public"]["Tables"]["workers"]["Row"];
export type AttendanceRow = Database["public"]["Tables"]["worker_attendance"]["Row"];
export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
export type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
export type HarvestRow = Database["public"]["Tables"]["harvest_records"]["Row"];
export type CalendarEventRow = Database["public"]["Tables"]["calendar_events"]["Row"];

// ============================================================
//  INVENTORY
// ============================================================

export type InventoryAlertKind = "low_stock" | "out_of_stock" | "expired" | "expiring_soon";

export interface InventoryWithAlerts extends InventoryRow {
  alerts: InventoryAlertKind[];
}

const EXPIRY_SOON_DAYS = 30;

export function deriveInventoryAlerts(item: InventoryRow): InventoryAlertKind[] {
  const alerts: InventoryAlertKind[] = [];
  const qty = Number(item.quantity ?? 0);
  const min = Number(item.min_stock_level ?? 0);
  if (qty <= 0) alerts.push("out_of_stock");
  else if (min > 0 && qty <= min) alerts.push("low_stock");
  if (item.expiry_date) {
    const exp = new Date(item.expiry_date).getTime();
    const now = Date.now();
    const days = (exp - now) / 86_400_000;
    if (days < 0) alerts.push("expired");
    else if (days <= EXPIRY_SOON_DAYS) alerts.push("expiring_soon");
  }
  return alerts;
}

export async function listInventory(
  supabase: SB,
  args: { farmId?: string; category?: InventoryRow["category"] },
): Promise<ServiceResult<{ items: InventoryWithAlerts[] }>> {
  let q = supabase.from("inventory_items").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  if (args.farmId) q = q.eq("farm_id", args.farmId);
  if (args.category) q = q.eq("category", args.category);
  const { data, error } = await q;
  if (error) return fail(error.message);
  return ok({ items: (data ?? []).map((i) => ({ ...i, alerts: deriveInventoryAlerts(i) })) });
}

export async function upsertInventory(
  supabase: SB,
  userId: string,
  payload: Partial<InventoryRow> & { farm_id: string; name: string; category: InventoryRow["category"] },
): Promise<ServiceResult<InventoryRow>> {
  const row = { ...payload, user_id: userId };
  const { data, error } = payload.id
    ? await supabase.from("inventory_items").update(row).eq("id", payload.id).select("*").maybeSingle()
    : await supabase.from("inventory_items").insert(row).select("*").maybeSingle();
  if (error || !data) return fail(error?.message ?? "Insert failed");
  return ok(data);
}

export async function softDeleteInventory(supabase: SB, id: string): Promise<ServiceResult<{ id: string }>> {
  const { error } = await supabase.from("inventory_items").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return fail(error.message);
  return ok({ id });
}

// ============================================================
//  EQUIPMENT
// ============================================================

export async function listEquipment(supabase: SB, farmId?: string): Promise<ServiceResult<{ items: EquipmentRow[] }>> {
  let q = supabase.from("equipment").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  if (farmId) q = q.eq("farm_id", farmId);
  const { data, error } = await q;
  if (error) return fail(error.message);
  return ok({ items: data ?? [] });
}

export async function upsertEquipment(
  supabase: SB,
  userId: string,
  payload: Partial<EquipmentRow> & { farm_id: string; name: string; type: EquipmentRow["type"] },
): Promise<ServiceResult<EquipmentRow>> {
  const row = { ...payload, user_id: userId };
  const { data, error } = payload.id
    ? await supabase.from("equipment").update(row).eq("id", payload.id).select("*").maybeSingle()
    : await supabase.from("equipment").insert(row).select("*").maybeSingle();
  if (error || !data) return fail(error?.message ?? "Insert failed");
  return ok(data);
}

export async function softDeleteEquipment(supabase: SB, id: string): Promise<ServiceResult<{ id: string }>> {
  const { error } = await supabase.from("equipment").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return fail(error.message);
  return ok({ id });
}

// ============================================================
//  WORKERS
// ============================================================

export async function listWorkers(supabase: SB, farmId?: string): Promise<ServiceResult<{ items: WorkerRow[] }>> {
  let q = supabase.from("workers").select("*").is("deleted_at", null).order("name");
  if (farmId) q = q.eq("farm_id", farmId);
  const { data, error } = await q;
  if (error) return fail(error.message);
  return ok({ items: data ?? [] });
}

export async function upsertWorker(
  supabase: SB,
  userId: string,
  payload: Partial<WorkerRow> & { farm_id: string; name: string },
): Promise<ServiceResult<WorkerRow>> {
  const row = { ...payload, user_id: userId };
  const { data, error } = payload.id
    ? await supabase.from("workers").update(row).eq("id", payload.id).select("*").maybeSingle()
    : await supabase.from("workers").insert(row).select("*").maybeSingle();
  if (error || !data) return fail(error?.message ?? "Insert failed");
  return ok(data);
}

export async function softDeleteWorker(supabase: SB, id: string): Promise<ServiceResult<{ id: string }>> {
  const { error } = await supabase.from("workers").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return fail(error.message);
  return ok({ id });
}

export async function listAttendance(
  supabase: SB,
  args: { workerId?: string; from?: string; to?: string },
): Promise<ServiceResult<{ items: AttendanceRow[] }>> {
  let q = supabase.from("worker_attendance").select("*").order("date", { ascending: false });
  if (args.workerId) q = q.eq("worker_id", args.workerId);
  if (args.from) q = q.gte("date", args.from);
  if (args.to) q = q.lte("date", args.to);
  const { data, error } = await q;
  if (error) return fail(error.message);
  return ok({ items: data ?? [] });
}

export async function recordAttendance(
  supabase: SB,
  userId: string,
  payload: { worker_id: string; date: string; status: AttendanceRow["status"]; hours_worked?: number | null; notes?: string | null },
): Promise<ServiceResult<AttendanceRow>> {
  const { data, error } = await supabase
    .from("worker_attendance")
    .upsert({ ...payload, user_id: userId }, { onConflict: "worker_id,date" })
    .select("*")
    .maybeSingle();
  if (error || !data) return fail(error?.message ?? "Failed");
  return ok(data);
}

// ============================================================
//  TASKS
// ============================================================

export async function listTasks(
  supabase: SB,
  args: { farmId?: string; status?: TaskRow["status"]; workerId?: string },
): Promise<ServiceResult<{ items: TaskRow[] }>> {
  let q = supabase.from("tasks").select("*").is("deleted_at", null).order("due_date", { ascending: true, nullsFirst: false });
  if (args.farmId) q = q.eq("farm_id", args.farmId);
  if (args.status) q = q.eq("status", args.status);
  if (args.workerId) q = q.eq("worker_id", args.workerId);
  const { data, error } = await q;
  if (error) return fail(error.message);
  return ok({ items: data ?? [] });
}

export async function upsertTask(
  supabase: SB,
  userId: string,
  payload: Partial<TaskRow> & { farm_id: string; title: string },
): Promise<ServiceResult<TaskRow>> {
  const row: Partial<TaskRow> & { user_id: string } = { ...payload, user_id: userId };
  if (payload.status === "completed" && !payload.completed_at) {
    row.completed_at = new Date().toISOString();
  }
  const { data, error } = payload.id
    ? await supabase.from("tasks").update(row).eq("id", payload.id).select("*").maybeSingle()
    : await supabase.from("tasks").insert(row).select("*").maybeSingle();
  if (error || !data) return fail(error?.message ?? "Insert failed");
  return ok(data);
}

export async function softDeleteTask(supabase: SB, id: string): Promise<ServiceResult<{ id: string }>> {
  const { error } = await supabase.from("tasks").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return fail(error.message);
  return ok({ id });
}

export async function createTaskFromRecommendation(
  supabase: SB,
  userId: string,
  args: { recommendation_id: string; due_date?: string | null; worker_id?: string | null },
): Promise<ServiceResult<TaskRow>> {
  const { data: rec, error: recErr } = await supabase
    .from("farm_recommendations")
    .select("id, farm_id, plot_id, module, summary, body, severity")
    .eq("id", args.recommendation_id)
    .maybeSingle();
  if (recErr || !rec) return fail(recErr?.message ?? "Recommendation not found");

  // Heuristic mapping: module → task_type
  const moduleToType: Record<string, TaskRow["task_type"]> = {
    irrigation: "irrigation",
    crop_health: "spraying",
    weather: "inspection",
    soil: "fertilizer_application",
    pest: "spraying",
    harvest: "harvest",
  };
  const task_type = moduleToType[String(rec.module ?? "")] ?? "manual_work";

  const severityToPriority: Record<string, TaskRow["priority"]> = {
    critical: "urgent",
    high: "high",
    medium: "medium",
    low: "low",
  };
  const priority = severityToPriority[String(rec.severity ?? "")] ?? "medium";

  return upsertTask(supabase, userId, {
    farm_id: rec.farm_id,
    plot_id: rec.plot_id ?? null,
    title: rec.summary ?? "AgriMind recommendation",
    description: rec.body ?? null,
    task_type,
    priority,
    status: "pending",
    progress: 0,
    due_date: args.due_date ?? null,
    worker_id: args.worker_id ?? null,
    source_recommendation_id: rec.id,
  });
}

// ============================================================
//  EXPENSES
// ============================================================

export async function listExpenses(
  supabase: SB,
  args: { farmId?: string; from?: string; to?: string; category?: ExpenseRow["category"] },
): Promise<ServiceResult<{ items: ExpenseRow[]; totals: { byCategory: Record<string, number>; byMonth: Record<string, number>; grandTotal: number } }>> {
  let q = supabase.from("expenses").select("*").is("deleted_at", null).order("expense_date", { ascending: false });
  if (args.farmId) q = q.eq("farm_id", args.farmId);
  if (args.from) q = q.gte("expense_date", args.from);
  if (args.to) q = q.lte("expense_date", args.to);
  if (args.category) q = q.eq("category", args.category);
  const { data, error } = await q;
  if (error) return fail(error.message);

  const items = data ?? [];
  const byCategory: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  let grandTotal = 0;
  for (const e of items) {
    const amt = Number(e.amount ?? 0);
    grandTotal += amt;
    byCategory[e.category] = (byCategory[e.category] ?? 0) + amt;
    const month = e.expense_date.slice(0, 7);
    byMonth[month] = (byMonth[month] ?? 0) + amt;
  }
  return ok({ items, totals: { byCategory, byMonth, grandTotal } });
}

export async function upsertExpense(
  supabase: SB,
  userId: string,
  payload: Partial<ExpenseRow> & { farm_id: string; amount: number; category: ExpenseRow["category"] },
): Promise<ServiceResult<ExpenseRow>> {
  const row = { ...payload, user_id: userId };
  const { data, error } = payload.id
    ? await supabase.from("expenses").update(row).eq("id", payload.id).select("*").maybeSingle()
    : await supabase.from("expenses").insert(row).select("*").maybeSingle();
  if (error || !data) return fail(error?.message ?? "Insert failed");
  return ok(data);
}

export async function softDeleteExpense(supabase: SB, id: string): Promise<ServiceResult<{ id: string }>> {
  const { error } = await supabase.from("expenses").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return fail(error.message);
  return ok({ id });
}

// ============================================================
//  HARVEST RECORDS
// ============================================================

export async function listHarvests(supabase: SB, farmId?: string): Promise<ServiceResult<{ items: HarvestRow[] }>> {
  let q = supabase.from("harvest_records").select("*").is("deleted_at", null).order("expected_harvest_date", { ascending: false, nullsFirst: false });
  if (farmId) q = q.eq("farm_id", farmId);
  const { data, error } = await q;
  if (error) return fail(error.message);
  return ok({ items: data ?? [] });
}

export async function upsertHarvest(
  supabase: SB,
  userId: string,
  payload: Partial<HarvestRow> & { farm_id: string; crop: string },
): Promise<ServiceResult<HarvestRow>> {
  const row = { ...payload, user_id: userId };
  const { data, error } = payload.id
    ? await supabase.from("harvest_records").update(row).eq("id", payload.id).select("*").maybeSingle()
    : await supabase.from("harvest_records").insert(row).select("*").maybeSingle();
  if (error || !data) return fail(error?.message ?? "Insert failed");
  return ok(data);
}

export async function softDeleteHarvest(supabase: SB, id: string): Promise<ServiceResult<{ id: string }>> {
  const { error } = await supabase.from("harvest_records").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return fail(error.message);
  return ok({ id });
}

// ============================================================
//  CALENDAR
// ============================================================

export interface CalendarItem {
  id: string;
  kind: "task" | "harvest" | "maintenance" | "event";
  title: string;
  starts_at: string;
  ends_at: string | null;
  ref_id: string;
  meta?: Record<string, unknown>;
}

export async function listCalendar(
  supabase: SB,
  args: { farmId?: string; from: string; to: string },
): Promise<ServiceResult<{ items: CalendarItem[]; events: CalendarEventRow[] }>> {
  const farmFilter = (q: any) => (args.farmId ? q.eq("farm_id", args.farmId) : q);

  const [tasks, harvests, equip, events] = await Promise.all([
    farmFilter(
      supabase.from("tasks").select("id, title, due_date, status, farm_id").is("deleted_at", null).not("due_date", "is", null).gte("due_date", args.from).lte("due_date", args.to),
    ),
    farmFilter(
      supabase
        .from("harvest_records")
        .select("id, crop, expected_harvest_date, actual_harvest_date, status, farm_id")
        .is("deleted_at", null)
        .or(`and(expected_harvest_date.gte.${args.from},expected_harvest_date.lte.${args.to}),and(actual_harvest_date.gte.${args.from},actual_harvest_date.lte.${args.to})`),
    ),
    farmFilter(
      supabase
        .from("equipment")
        .select("id, name, next_maintenance_date, farm_id")
        .is("deleted_at", null)
        .not("next_maintenance_date", "is", null)
        .gte("next_maintenance_date", args.from)
        .lte("next_maintenance_date", args.to),
    ),
    farmFilter(
      supabase
        .from("calendar_events")
        .select("*")
        .is("deleted_at", null)
        .gte("starts_at", args.from)
        .lte("starts_at", args.to + "T23:59:59"),
    ),
  ]);

  const items: CalendarItem[] = [];
  for (const t of tasks.data ?? []) {
    if (!t.due_date) continue;
    items.push({ id: `task:${t.id}`, kind: "task", title: t.title, starts_at: t.due_date, ends_at: null, ref_id: t.id, meta: { status: t.status } });
  }
  for (const h of harvests.data ?? []) {
    const d = h.actual_harvest_date ?? h.expected_harvest_date;
    if (!d) continue;
    items.push({ id: `harvest:${h.id}`, kind: "harvest", title: `Harvest: ${h.crop}`, starts_at: d, ends_at: null, ref_id: h.id, meta: { status: h.status } });
  }
  for (const e of equip.data ?? []) {
    if (!e.next_maintenance_date) continue;
    items.push({ id: `maint:${e.id}`, kind: "maintenance", title: `Maintenance: ${e.name}`, starts_at: e.next_maintenance_date, ends_at: null, ref_id: e.id });
  }
  const evRows = (events.data ?? []) as CalendarEventRow[];
  for (const ev of evRows) {
    items.push({ id: `event:${ev.id}`, kind: "event", title: ev.title, starts_at: ev.starts_at, ends_at: ev.ends_at, ref_id: ev.id, meta: { type: ev.event_type } });
  }

  items.sort((a, b) => (a.starts_at < b.starts_at ? -1 : 1));
  return ok({ items, events: evRows });
}

export async function upsertCalendarEvent(
  supabase: SB,
  userId: string,
  payload: Partial<CalendarEventRow> & { farm_id: string; title: string; starts_at: string },
): Promise<ServiceResult<CalendarEventRow>> {
  const row = { ...payload, user_id: userId };
  const { data, error } = payload.id
    ? await supabase.from("calendar_events").update(row).eq("id", payload.id).select("*").maybeSingle()
    : await supabase.from("calendar_events").insert(row).select("*").maybeSingle();
  if (error || !data) return fail(error?.message ?? "Insert failed");
  return ok(data);
}

export async function softDeleteCalendarEvent(supabase: SB, id: string): Promise<ServiceResult<{ id: string }>> {
  const { error } = await supabase.from("calendar_events").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return fail(error.message);
  return ok({ id });
}

// ============================================================
//  DASHBOARD AGGREGATE
// ============================================================

export interface FarmOSDashboard {
  today_tasks: TaskRow[];
  open_task_count: number;
  low_stock: InventoryWithAlerts[];
  upcoming_harvest: HarvestRow[];
  maintenance_due: EquipmentRow[];
  expense_summary: { thisMonth: number; lastMonth: number; byCategory: Record<string, number> };
}

export async function getFarmOSDashboard(supabase: SB, farmId?: string): Promise<ServiceResult<FarmOSDashboard>> {
  const todayStr = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

  const farmFilter = <T extends { eq: any }>(q: T): T => (farmId ? (q as any).eq("farm_id", farmId) : q);

  const [tasksTodayRes, openTasksRes, inv, harvest, equip, expenses] = await Promise.all([
    farmFilter(
      supabase.from("tasks").select("*").is("deleted_at", null).neq("status", "completed").neq("status", "cancelled").lte("due_date", todayStr),
    ),
    farmFilter(supabase.from("tasks").select("id", { count: "exact", head: true }).is("deleted_at", null).in("status", ["pending", "in_progress"])),
    farmFilter(supabase.from("inventory_items").select("*").is("deleted_at", null)),
    farmFilter(
      supabase
        .from("harvest_records")
        .select("*")
        .is("deleted_at", null)
        .in("status", ["planned", "in_progress"])
        .lte("expected_harvest_date", in30)
        .not("expected_harvest_date", "is", null)
        .order("expected_harvest_date"),
    ),
    farmFilter(
      supabase
        .from("equipment")
        .select("*")
        .is("deleted_at", null)
        .or(`status.eq.maintenance_due,and(next_maintenance_date.lte.${in30},next_maintenance_date.not.is.null)`),
    ),
    farmFilter(supabase.from("expenses").select("amount, category, expense_date").is("deleted_at", null)),
  ]);

  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = lastMonthDate.toISOString().slice(0, 7);

  let thisTotal = 0;
  let lastTotal = 0;
  const byCategory: Record<string, number> = {};
  for (const e of (expenses.data ?? []) as { amount: number; category: string; expense_date: string }[]) {
    const amt = Number(e.amount ?? 0);
    const m = e.expense_date.slice(0, 7);
    if (m === thisMonth) {
      thisTotal += amt;
      byCategory[e.category] = (byCategory[e.category] ?? 0) + amt;
    } else if (m === lastMonth) lastTotal += amt;
  }

  const invItems = ((inv.data ?? []) as InventoryRow[]).map((i) => ({ ...i, alerts: deriveInventoryAlerts(i) }));

  return ok({
    today_tasks: (tasksTodayRes.data ?? []) as TaskRow[],
    open_task_count: openTasksRes.count ?? 0,
    low_stock: invItems.filter((i) => i.alerts.length > 0),
    upcoming_harvest: (harvest.data ?? []) as HarvestRow[],
    maintenance_due: (equip.data ?? []) as EquipmentRow[],
    expense_summary: { thisMonth: thisTotal, lastMonth: lastTotal, byCategory },
  });
}
