/**
 * Yield prediction service — Phase 2 stub.
 *
 * TODO(phase-2): Train / call a regression model using historical soil,
 * irrigation, and weather features. Never fabricate a yield number.
 */
import { fail, NOT_CONFIGURED, type ServiceResult } from "./result";

export type PredictYieldInput = {
  farm_id: string;
  crop_type: string;
  area: number;
  soil_records: unknown[];
  irrigation_records: unknown[];
  weather_records: unknown[];
};

export type YieldPrediction = {
  predicted_yield: number; // tons
  confidence: number; // 0..1
  model_version: string;
  generated_at: string;
};

export async function predictYield(
  _input: PredictYieldInput,
): Promise<ServiceResult<YieldPrediction>> {
  return fail(NOT_CONFIGURED);
}
