/**
 * Irrigation recommendation engine — Phase 2 stub.
 *
 * TODO(phase-2): Combine soil_records + weather_records + crop ET model to
 * produce a real recommendation. Do NOT guess.
 */
import { fail, NOT_CONFIGURED, type ServiceResult } from "./result";
import type { SoilRecordRow, IrrigationRecordRow } from "../types/domain";

export type IrrigationRecommendationInput = {
  farm_id: string;
  plot_id: string | null;
  soil_records: SoilRecordRow[];
  weather_records: unknown[];
  crop_type: string | null;
};

export type IrrigationRecommendation = {
  irrigation_needed: boolean;
  reason: string;
  suggested_water_volume: number; // liters
  confidence: number; // 0..1
  generated_at: string;
};

export async function recommendIrrigation(
  _input: IrrigationRecommendationInput,
): Promise<ServiceResult<IrrigationRecommendation>> {
  return fail(NOT_CONFIGURED);
}

export type _UnusedIrrig = IrrigationRecordRow;
