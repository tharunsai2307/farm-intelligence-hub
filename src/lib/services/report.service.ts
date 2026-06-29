/**
 * Report generation service — Phase 2 stub.
 *
 * TODO(phase-2): Render a real farm report (PDF or shareable HTML) from
 * stored Supabase data plus Phase 2 analytics.
 */
import { fail, NOT_CONFIGURED, type ServiceResult } from "./result";

export type GenerateReportInput = {
  farm_id: string;
  range_start: string;
  range_end: string;
};

export type FarmReport = {
  report_id: string;
  farm_id: string;
  generated_at: string;
  sections: Array<{ title: string; body: string }>;
  source_data: Record<string, unknown>;
};

export async function generateFarmReport(
  _input: GenerateReportInput,
): Promise<ServiceResult<FarmReport>> {
  return fail(NOT_CONFIGURED);
}
