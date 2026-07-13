/**
 * FarmOS — TanStack server function wrappers.
 *
 * Loads server-only logic from farmos.server.ts dynamically so this file is
 * safe to import from route components.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ----- Enum sources -----
const inventoryCategory = z.enum([
  "seeds",
  "fertilizers",
  "pesticides",
  "organic_inputs",
  "tools",
  "spare_parts",
  "storage_materials",
  "other",
]);
const equipmentType = z.enum([
  "tractor",
  "pump_set",
  "drip_system",
  "sprayer",
  "harvest_machine",
  "sensor",
  "other",
]);
const equipmentStatus = z.enum(["operational", "maintenance_due", "out_of_service"]);
const taskType = z.enum([
  "irrigation",
  "spraying",
  "harvest",
  "inspection",
  "fertilizer_application",
  "maintenance",
  "manual_work",
  "other",
]);
const taskPriority = z.enum(["low", "medium", "high", "urgent"]);
const taskStatus = z.enum(["pending", "in_progress", "completed", "cancelled"]);
const expenseCategory = z.enum([
  "seeds",
  "labor",
  "fuel",
  "water",
  "electricity",
  "equipment",
  "maintenance",
  "transport",
  "other",
]);
const paymentMethod = z.enum(["cash", "bank_transfer", "upi", "card", "credit", "other"]);
const harvestStatus = z.enum(["planned", "in_progress", "completed", "sold", "cancelled"]);
const attendanceStatus = z.enum(["present", "absent", "half_day", "leave"]);
const calendarEventType = z.enum([
  "task",
  "harvest",
  "maintenance",
  "weather",
  "observation",
  "irrigation",
  "custom",
]);

const uuid = z.string().uuid();

// =================== INVENTORY ===================
const inventoryInput = z.object({
  id: uuid.optional(),
  farm_id: uuid,
  name: z.string().trim().min(1).max(120),
  category: inventoryCategory,
  quantity: z.number().nonnegative().default(0),
  unit: z.string().trim().min(1).max(20).default("unit"),
  supplier: z.string().trim().max(120).nullable().optional(),
  purchase_date: z.string().nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  cost: z.number().nonnegative().nullable().optional(),
  storage_location: z.string().trim().max(120).nullable().optional(),
  min_stock_level: z.number().nonnegative().nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const listInventoryItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string }) =>
    z.object({ farm_id: uuid.optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { listInventory } = await import("./farmos.server");
    return listInventory(context.supabase, { farmId: data.farm_id });
  });

export const saveInventoryItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof inventoryInput>) => inventoryInput.parse(input))
  .handler(async ({ data, context }) => {
    const { upsertInventory } = await import("./farmos.server");
    return upsertInventory(context.supabase, context.userId, data as any);
  });

export const deleteInventoryItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { softDeleteInventory } = await import("./farmos.server");
    return softDeleteInventory(context.supabase, data.id);
  });

// =================== EQUIPMENT ===================
const equipmentInput = z.object({
  id: uuid.optional(),
  farm_id: uuid,
  name: z.string().trim().min(1).max(120),
  type: equipmentType,
  manufacturer: z.string().trim().max(120).nullable().optional(),
  purchase_date: z.string().nullable().optional(),
  status: equipmentStatus.default("operational"),
  last_maintenance_date: z.string().nullable().optional(),
  next_maintenance_date: z.string().nullable().optional(),
  operating_hours: z.number().nonnegative().nullable().optional(),
  serial_number: z.string().trim().max(120).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const listEquipmentItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string }) =>
    z.object({ farm_id: uuid.optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { listEquipment } = await import("./farmos.server");
    return listEquipment(context.supabase, data.farm_id);
  });

export const saveEquipmentItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof equipmentInput>) => equipmentInput.parse(input))
  .handler(async ({ data, context }) => {
    const { upsertEquipment } = await import("./farmos.server");
    return upsertEquipment(context.supabase, context.userId, data as any);
  });

export const deleteEquipmentItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { softDeleteEquipment } = await import("./farmos.server");
    return softDeleteEquipment(context.supabase, data.id);
  });

// =================== WORKERS ===================
const workerInput = z.object({
  id: uuid.optional(),
  farm_id: uuid,
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(30).nullable().optional(),
  role: z.string().trim().max(60).nullable().optional(),
  daily_wage: z.number().nonnegative().nullable().optional(),
  skills: z.array(z.string().trim().max(40)).max(20).optional(),
  available: z.boolean().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const listFarmWorkers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string }) =>
    z.object({ farm_id: uuid.optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { listWorkers } = await import("./farmos.server");
    return listWorkers(context.supabase, data.farm_id);
  });

export const saveFarmWorker = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof workerInput>) => workerInput.parse(input))
  .handler(async ({ data, context }) => {
    const { upsertWorker } = await import("./farmos.server");
    return upsertWorker(context.supabase, context.userId, data as any);
  });

export const deleteFarmWorker = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { softDeleteWorker } = await import("./farmos.server");
    return softDeleteWorker(context.supabase, data.id);
  });

export const listWorkerAttendance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { worker_id?: string; from?: string; to?: string }) =>
    z
      .object({
        worker_id: uuid.optional(),
        from: z.string().optional(),
        to: z.string().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { listAttendance } = await import("./farmos.server");
    return listAttendance(context.supabase, {
      workerId: data.worker_id,
      from: data.from,
      to: data.to,
    });
  });

export const saveWorkerAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      worker_id: string;
      date: string;
      status: z.infer<typeof attendanceStatus>;
      hours_worked?: number | null;
      notes?: string | null;
    }) =>
      z
        .object({
          worker_id: uuid,
          date: z.string(),
          status: attendanceStatus,
          hours_worked: z.number().nonnegative().nullable().optional(),
          notes: z.string().max(2000).nullable().optional(),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { recordAttendance } = await import("./farmos.server");
    return recordAttendance(context.supabase, context.userId, data);
  });

// =================== TASKS ===================
const taskInput = z.object({
  id: uuid.optional(),
  farm_id: uuid,
  plot_id: uuid.nullable().optional(),
  worker_id: uuid.nullable().optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(4000).nullable().optional(),
  task_type: taskType.default("manual_work"),
  priority: taskPriority.default("medium"),
  due_date: z.string().nullable().optional(),
  status: taskStatus.default("pending"),
  progress: z.number().int().min(0).max(100).default(0),
  completion_notes: z.string().max(2000).nullable().optional(),
});

export const listFarmTasks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { farm_id?: string; status?: z.infer<typeof taskStatus>; worker_id?: string }) =>
      z
        .object({
          farm_id: uuid.optional(),
          status: taskStatus.optional(),
          worker_id: uuid.optional(),
        })
        .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { listTasks } = await import("./farmos.server");
    return listTasks(context.supabase, {
      farmId: data.farm_id,
      status: data.status,
      workerId: data.worker_id,
    });
  });

export const saveFarmTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof taskInput>) => taskInput.parse(input))
  .handler(async ({ data, context }) => {
    const { upsertTask } = await import("./farmos.server");
    return upsertTask(context.supabase, context.userId, data as any);
  });

export const deleteFarmTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { softDeleteTask } = await import("./farmos.server");
    return softDeleteTask(context.supabase, data.id);
  });

export const taskFromRecommendation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { recommendation_id: string; due_date?: string | null; worker_id?: string | null }) =>
      z
        .object({
          recommendation_id: uuid,
          due_date: z.string().nullable().optional(),
          worker_id: uuid.nullable().optional(),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { createTaskFromRecommendation } = await import("./farmos.server");
    return createTaskFromRecommendation(context.supabase, context.userId, data);
  });

// =================== EXPENSES ===================
const expenseInput = z.object({
  id: uuid.optional(),
  farm_id: uuid,
  amount: z.number().nonnegative(),
  currency: z.string().trim().min(1).max(8).default("INR"),
  category: expenseCategory,
  description: z.string().max(1000).nullable().optional(),
  expense_date: z.string(),
  receipt_url: z.string().url().nullable().optional(),
  payment_method: paymentMethod.nullable().optional(),
});

export const listFarmExpenses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      farm_id?: string;
      from?: string;
      to?: string;
      category?: z.infer<typeof expenseCategory>;
    }) =>
      z
        .object({
          farm_id: uuid.optional(),
          from: z.string().optional(),
          to: z.string().optional(),
          category: expenseCategory.optional(),
        })
        .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { listExpenses } = await import("./farmos.server");
    return listExpenses(context.supabase, {
      farmId: data.farm_id,
      from: data.from,
      to: data.to,
      category: data.category,
    });
  });

export const saveFarmExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof expenseInput>) => expenseInput.parse(input))
  .handler(async ({ data, context }) => {
    const { upsertExpense } = await import("./farmos.server");
    return upsertExpense(context.supabase, context.userId, data as any);
  });

export const deleteFarmExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { softDeleteExpense } = await import("./farmos.server");
    return softDeleteExpense(context.supabase, data.id);
  });

// =================== HARVEST ===================
const harvestInput = z.object({
  id: uuid.optional(),
  farm_id: uuid,
  plot_id: uuid.nullable().optional(),
  crop: z.string().trim().min(1).max(120),
  expected_harvest_date: z.string().nullable().optional(),
  actual_harvest_date: z.string().nullable().optional(),
  expected_quantity: z.number().nonnegative().nullable().optional(),
  actual_quantity: z.number().nonnegative().nullable().optional(),
  unit: z.string().trim().max(20).nullable().optional(),
  storage_location: z.string().trim().max(120).nullable().optional(),
  buyer: z.string().trim().max(120).nullable().optional(),
  status: harvestStatus.default("planned"),
  notes: z.string().max(2000).nullable().optional(),
});

export const listFarmHarvests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string }) =>
    z.object({ farm_id: uuid.optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { listHarvests } = await import("./farmos.server");
    return listHarvests(context.supabase, data.farm_id);
  });

export const saveFarmHarvest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof harvestInput>) => harvestInput.parse(input))
  .handler(async ({ data, context }) => {
    const { upsertHarvest } = await import("./farmos.server");
    return upsertHarvest(context.supabase, context.userId, data as any);
  });

export const deleteFarmHarvest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { softDeleteHarvest } = await import("./farmos.server");
    return softDeleteHarvest(context.supabase, data.id);
  });

// =================== CALENDAR ===================
const calendarEventInput = z.object({
  id: uuid.optional(),
  farm_id: uuid,
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  event_type: calendarEventType.default("custom"),
  starts_at: z.string(),
  ends_at: z.string().nullable().optional(),
  all_day: z.boolean().optional(),
});

export const listFarmCalendar = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string; from: string; to: string }) =>
    z.object({ farm_id: uuid.optional(), from: z.string(), to: z.string() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { listCalendar } = await import("./farmos.server");
    return listCalendar(context.supabase, { farmId: data.farm_id, from: data.from, to: data.to });
  });

export const saveCalendarEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof calendarEventInput>) => calendarEventInput.parse(input))
  .handler(async ({ data, context }) => {
    const { upsertCalendarEvent } = await import("./farmos.server");
    return upsertCalendarEvent(context.supabase, context.userId, data as any);
  });

export const deleteCalendarEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { softDeleteCalendarEvent } = await import("./farmos.server");
    return softDeleteCalendarEvent(context.supabase, data.id);
  });

// =================== DASHBOARD ===================
export const getFarmOSOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { farm_id?: string }) =>
    z.object({ farm_id: uuid.optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { getFarmOSDashboard } = await import("./farmos.server");
    return getFarmOSDashboard(context.supabase, data.farm_id);
  });
