/**
 * AI Crop Health service — Phase 2 stub.
 *
 * TODO(phase-2): Wire to a real image-classification model (e.g. PlantVillage
 * fine-tuned model served via Lovable AI Gateway or a private endpoint).
 * Never invent a disease name, confidence, or severity here.
 */
import { fail, NOT_CONFIGURED, type ServiceResult } from "./result";

export type AnalyzeCropInput = {
  image_url: string;
  crop_type: string;
  farm_id: string;
  user_id: string;
};

export type AnalyzeCropOutput = {
  disease_name: string | null;
  confidence: number;
  severity: "low" | "medium" | "high" | "unknown";
  recommendation: string;
  model_version: string;
  analyzed_at: string;
};

export async function analyzeCropImage(
  _input: AnalyzeCropInput,
): Promise<ServiceResult<AnalyzeCropOutput>> {
  return fail(NOT_CONFIGURED);
}
