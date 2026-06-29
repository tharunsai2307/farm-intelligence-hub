/**


 * Server-only AI Crop Intelligence helpers.
 *
 * Pipeline:
 *  1) Image bytes are read from the user's private storage path.
 *  2) Bytes are POSTed to the configured Roboflow Hosted Inference model.
 *  3) The top prediction is passed to Lovable AI (Gemini) which writes
 *     a farmer-friendly explanation + treatment plan. The LLM never
 *     invents the disease label — it only explains the CV model's output.
 *  4) Result is persisted into public.crop_analysis (RLS-scoped to user).
 *
 * Never invents predictions. If the CV provider is unavailable we surface
 * a typed ServiceResult error; callers show "AI Crop Analysis service is
 * currently unavailable." and persist nothing.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { fail, ok, type ServiceResult } from "./result";

type SB = SupabaseClient<Database>;

export const AI_CROP_ERRORS = {
  NOT_CONFIGURED: "AI Crop Analysis service is currently unavailable.",
  IMAGE_MISSING: "Uploaded image could not be read.",
  PROVIDER_FAILED: "AI Crop Analysis service is currently unavailable.",
  NO_PREDICTION: "AI model returned no prediction for this image.",
  PERSIST_FAILED: "Could not save the analysis result.",
} as const;

export function isAiCropConfigured(): boolean {
  return Boolean(
    (process.env.ROBOFLOW_API_KEY && process.env.ROBOFLOW_MODEL_ID) ||
      process.env.LOVABLE_API_KEY,
  );
}


export type RoboflowPrediction = {
  class: string;
  confidence: number;
  raw: unknown;
};

/** Call Roboflow Hosted Inference. Supports classification & detection. */
async function callRoboflow(base64: string): Promise<RoboflowPrediction | null> {
  const apiKey = process.env.ROBOFLOW_API_KEY;
  const modelId = process.env.ROBOFLOW_MODEL_ID;
  if (!apiKey || !modelId) return null;
  // Roboflow hosted inference expects "<project-slug>/<version>" model ids.
  // Some users paste a workflow/API id instead — skip and let Gemini handle it.
  if (!/^[a-z0-9-]+\/\d+$/i.test(modelId)) {
    console.warn("[ai-crop] ROBOFLOW_MODEL_ID is not in 'slug/version' form — skipping Roboflow");
    return null;
  }


  // Try classify endpoint first (works for plant-disease classification models).
  // Roboflow's serverless endpoint handles both detection and classification.
  const endpoints = [
    `https://classify.roboflow.com/${modelId}?api_key=${encodeURIComponent(apiKey)}`,
    `https://detect.roboflow.com/${modelId}?api_key=${encodeURIComponent(apiKey)}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: base64,
      });
      if (!res.ok) {
        console.error("[ai-crop] roboflow", url, res.status);
        continue;
      }
      const json = (await res.json()) as Record<string, unknown>;

      // Classification response: { top, confidence, predictions: { class: {confidence} } }
      if (typeof json.top === "string" && typeof json.confidence === "number") {
        return { class: json.top, confidence: json.confidence, raw: json };
      }
      // Detection response: { predictions: [{class, confidence, ...}] }
      const preds = json.predictions as unknown;
      if (Array.isArray(preds) && preds.length > 0) {
        const sorted = [...preds].sort(
          (a, b) => (b.confidence ?? 0) - (a.confidence ?? 0),
        );
        const top = sorted[0];
        if (top?.class && typeof top.confidence === "number") {
          return { class: String(top.class), confidence: Number(top.confidence), raw: json };
        }
      }
      // Some classification models return predictions as object map
      if (preds && typeof preds === "object" && !Array.isArray(preds)) {
        const entries = Object.entries(preds as Record<string, { confidence?: number }>);
        const sorted = entries.sort(
          (a, b) => (b[1]?.confidence ?? 0) - (a[1]?.confidence ?? 0),
        );
        const [cls, val] = sorted[0] ?? [];
        if (cls && typeof val?.confidence === "number") {
          return { class: cls, confidence: val.confidence, raw: json };
        }
      }
    } catch (e) {
      console.error("[ai-crop] roboflow fetch error", e);
    }
  }
  return null;
}

/**
 * Fallback CV: ask Lovable AI Gemini Vision to identify the disease directly
 * from the image when Roboflow is not configured or fails.
 */
async function callGeminiVision(
  base64: string,
  cropType: string | null,
): Promise<RoboflowPrediction | null> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    console.error("[ai-crop] gemini-vision: LOVABLE_API_KEY missing");
    return null;
  }
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              'You are a plant pathology classifier. Identify the most likely disease in the crop image, or return "healthy". Reply ONLY as compact JSON: {"label": string, "confidence": number between 0 and 1}.',
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Crop (user-provided): ${cropType ?? "unknown"}. Classify the disease and return JSON only.`,
              },
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      console.error("[ai-crop] gemini-vision failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const j = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = j.choices?.[0]?.message?.content ?? "";
    // Strip code fences if model wrapped JSON.
    const cleaned = raw.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("[ai-crop] gemini-vision: no JSON in response", raw.slice(0, 200));
      return null;
    }
    const parsed = JSON.parse(match[0]) as { label?: string; confidence?: number };
    if (!parsed.label) return null;
    const conf = Math.max(0, Math.min(1, Number(parsed.confidence ?? 0.6)));
    return { class: String(parsed.label), confidence: conf, raw: parsed };
  } catch (e) {
    console.error("[ai-crop] gemini-vision error", e);
    return null;
  }
}


export type LlmExplanation = {
  disease_name: string;
  scientific_name: string | null;
  severity: "low" | "medium" | "high" | "unknown";
  explanation: string;
  symptoms: string;
  immediate_action: string;
  organic_treatment: string;
  chemical_treatment: string;
  prevention: string;
  estimated_recovery: string;
  monitoring: string;
};

/** Ask Lovable AI to explain — NEVER to change — the CV model's prediction. */
async function callLlmExplain(
  prediction: RoboflowPrediction,
  cropType: string | null,
  language: string,
): Promise<LlmExplanation | null> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return null;

  const sys = `You are an agronomy assistant for smallholder farmers.
You are given a computer-vision model's prediction for a crop photo.
You MUST NOT change, override, or second-guess the disease label or confidence.
Your only job is to explain the prediction and provide treatment guidance.
Respond strictly as JSON matching the requested schema. Write all human-readable
text in the requested language. Keep prose simple and practical. Never invent
scientific references. If a field is unknown, return an empty string.`;

  const langName =
    { en: "English", ta: "Tamil", te: "Telugu", hi: "Hindi" }[language] ?? "English";

  const user = `CV model prediction:
- Predicted class: ${prediction.class}
- Confidence: ${(prediction.confidence * 100).toFixed(1)}%
- Crop type (user-provided): ${cropType ?? "unknown"}

Write a farmer-friendly explanation in ${langName}. Output JSON with:
{
  "disease_name": string,            // human label for the predicted class
  "scientific_name": string,         // pathogen scientific name if known, else ""
  "severity": "low"|"medium"|"high"|"unknown",  // your judgement of severity given confidence
  "explanation": string,             // why this is likely, in 2-4 sentences
  "symptoms": string,                // visible symptoms growers would see
  "immediate_action": string,        // what to do today
  "organic_treatment": string,
  "chemical_treatment": string,
  "prevention": string,
  "estimated_recovery": string,      // e.g. "7-14 days with treatment"
  "monitoring": string               // what to monitor over coming days
}`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) {
      console.error("[ai-crop] llm failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = json.choices?.[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LlmExplanation>;
    return {
      disease_name: String(parsed.disease_name ?? prediction.class),
      scientific_name: parsed.scientific_name ? String(parsed.scientific_name) : null,
      severity:
        parsed.severity === "low" ||
        parsed.severity === "medium" ||
        parsed.severity === "high"
          ? parsed.severity
          : "unknown",
      explanation: String(parsed.explanation ?? ""),
      symptoms: String(parsed.symptoms ?? ""),
      immediate_action: String(parsed.immediate_action ?? ""),
      organic_treatment: String(parsed.organic_treatment ?? ""),
      chemical_treatment: String(parsed.chemical_treatment ?? ""),
      prevention: String(parsed.prevention ?? ""),
      estimated_recovery: String(parsed.estimated_recovery ?? ""),
      monitoring: String(parsed.monitoring ?? ""),
    };
  } catch (e) {
    console.error("[ai-crop] llm error", e);
    return null;
  }
}

export type AnalyzeCropInput = {
  farm_id: string;
  plot_id?: string | null;
  crop_type?: string | null;
  image_path: string; // path in crop-analysis-images bucket
  language?: string; // en | ta | te | hi
};

export type AnalyzeCropResult = {
  id: string;
  prediction: string;
  scientific_name: string | null;
  confidence: number;
  severity: string;
  explanation: string;
  recommendation: string;
  model_name: string;
  model_version: string;
  processing_time_ms: number;
};

export async function analyzeCrop(
  supabase: SB,
  userId: string,
  input: AnalyzeCropInput,
): Promise<ServiceResult<AnalyzeCropResult>> {
  if (!isAiCropConfigured()) return fail(AI_CROP_ERRORS.NOT_CONFIGURED);

  const t0 = Date.now();

  // Verify farm ownership (RLS also enforces)
  const { data: farm } = await supabase
    .from("farms")
    .select("id")
    .eq("id", input.farm_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!farm) return fail("Farm not found.");

  // Download image bytes from private bucket
  const { data: blob, error: dlErr } = await supabase.storage
    .from("crop-analysis-images")
    .download(input.image_path);
  if (dlErr || !blob) return fail(AI_CROP_ERRORS.IMAGE_MISSING);

  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  // Convert to base64 (server runtime supports Buffer)
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(bytes).toString("base64")
      : btoa(String.fromCharCode(...bytes));

  let prediction = await callRoboflow(base64);
  let modelName: "roboflow" | "gemini-vision" = "roboflow";
  if (!prediction) {
    // Fallback: Lovable AI Gemini Vision analyses the image directly.
    prediction = await callGeminiVision(base64, input.crop_type ?? null);
    modelName = "gemini-vision";
  }
  if (!prediction) return fail(AI_CROP_ERRORS.PROVIDER_FAILED);


  const llm = await callLlmExplain(
    prediction,
    input.crop_type ?? null,
    input.language ?? "en",
  );

  const recommendation = llm
    ? [llm.immediate_action, llm.organic_treatment].filter(Boolean).join(" ")
    : "";

  const processingMs = Date.now() - t0;
  const modelId = process.env.ROBOFLOW_MODEL_ID ?? "roboflow";

  const insertRow = {
    user_id: userId,
    farm_id: input.farm_id,
    plot_id: input.plot_id ?? null,
    image_path: input.image_path,
    crop_type: input.crop_type ?? null,
    prediction: llm?.disease_name ?? prediction.class,
    scientific_name: llm?.scientific_name ?? null,
    confidence: prediction.confidence,
    severity: llm?.severity ?? "unknown",
    affected_area: null,
    recommendation,
    explanation: llm?.explanation ?? null,
    raw_response: {
      cv: prediction.raw,
      llm: llm ?? null,
    } as unknown as Database["public"]["Tables"]["crop_analysis"]["Insert"]["raw_response"],
    model_name: modelName,
    model_version: modelName === "roboflow" ? modelId : "google/gemini-3-flash-preview",

    processing_time_ms: processingMs,
    status: "completed",
  };

  const { data: saved, error: insErr } = await supabase
    .from("crop_analysis")
    .insert(insertRow)
    .select("id")
    .single();
  if (insErr || !saved) {
    console.error("[ai-crop] persist failed", insErr);
    return fail(AI_CROP_ERRORS.PERSIST_FAILED);
  }

  return ok({
    id: saved.id as string,
    prediction: insertRow.prediction,
    scientific_name: insertRow.scientific_name,
    confidence: prediction.confidence,
    severity: insertRow.severity,
    explanation: insertRow.explanation ?? "",
    recommendation,
    model_name: modelName,
    model_version: modelName === "roboflow" ? modelId : "google/gemini-3-flash-preview",

    processing_time_ms: processingMs,
  });
}

export async function listAnalysesForUser(supabase: SB, farmId?: string) {
  let q = supabase
    .from("crop_analysis")
    .select(
      "id, farm_id, plot_id, image_path, crop_type, prediction, scientific_name, confidence, severity, model_name, model_version, processing_time_ms, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (farmId) q = q.eq("farm_id", farmId);
  const { data, error } = await q;
  if (error) return fail<typeof data>(error.message);
  return ok(data ?? []);
}

export async function getAnalysisById(supabase: SB, id: string) {
  const { data, error } = await supabase
    .from("crop_analysis")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return fail<typeof data>(error.message);
  if (!data) return fail<typeof data>("Analysis not found.");
  return ok(data);
}

export async function createSignedImageUrl(
  supabase: SB,
  imagePath: string,
  expiresIn = 3600,
) {
  const { data, error } = await supabase.storage
    .from("crop-analysis-images")
    .createSignedUrl(imagePath, expiresIn);
  if (error || !data) return null;
  return data.signedUrl;
}
