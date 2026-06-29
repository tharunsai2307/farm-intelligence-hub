import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Leaf, History, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImageUploader } from "@/components/crop-health/image-uploader";
import { AnalysisProgress } from "@/components/crop-health/analysis-progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { listFarms } from "@/lib/services/farms.functions";
import { analyzeCropImage, getAiCropStatus } from "@/lib/services/ai-crop.service";
import { validateCropImage } from "@/lib/storage/upload-validation";

export const Route = createFileRoute("/_authenticated/app/crop-health/")({
  head: () => ({
    meta: [
      { title: "AI Crop Intelligence — AgriTwin OS" },
      { name: "description", content: "Upload a leaf photo to detect diseases and get AI-generated treatment plans powered by computer vision and Gemini." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "AI Crop Intelligence — AgriTwin OS" },
      { property: "og:description", content: "Detect crop diseases from photos with computer vision and AI treatment plans." },
      { property: "og:url", content: "https://agri-twin-os.lovable.app/app/crop-health" },
    ],
  }),
  component: CropHealthPage,
});

function CropHealthPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [farmId, setFarmId] = useState<string>("");
  const [cropType, setCropType] = useState<string>("");
  const [language, setLanguage] = useState<"en" | "ta" | "te" | "hi">("en");

  const farmsFn = useServerFn(listFarms);
  const statusFn = useServerFn(getAiCropStatus);
  const analyzeFn = useServerFn(analyzeCropImage);

  const farmsQ = useQuery({
    queryKey: ["farms"],
    queryFn: () => farmsFn(),
  });

  const statusQ = useQuery({
    queryKey: ["ai-crop-status"],
    queryFn: () => statusFn(),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please select an image first.");
      if (!farmId) throw new Error("Please select a farm.");
      const err = validateCropImage(file);
      if (err) throw new Error(err);

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Not authenticated.");

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${uid}/${farmId}/analysis/${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("crop-analysis-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw new Error(upErr.message);

      const res = await analyzeFn({
        data: {
          farm_id: farmId,
          crop_type: cropType || null,
          image_path: path,
          language,
        },
      });
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Analysis complete");
      navigate({
        to: "/app/crop-health/details/$id",
        params: { id: data.id },
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const farms = farmsQ.data?.items ?? [];
  const configured = statusQ.data?.success ?? false;

  // Default-select primary farm
  if (!farmId && farms.length > 0) {
    setFarmId(farms[0].id);
    if (!cropType && farms[0].primary_crop) setCropType(farms[0].primary_crop);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <PageHeader
        title="AI Crop Intelligence"
        description="Analyze crop images using real AI models to detect diseases, nutrient deficiencies and plant health."
        actions={
          <Button asChild variant="outline">
            <Link to="/app/crop-health/history">
              <History className="mr-2 h-4 w-4" />
              History
            </Link>
          </Button>
        }
      />

      {!configured && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>AI Crop Analysis service is currently unavailable.</AlertTitle>
          <AlertDescription>
            A computer-vision model is not configured. Configure Roboflow credentials to
            enable real predictions.
          </AlertDescription>
        </Alert>
      )}

      {farms.length === 0 && !farmsQ.isLoading && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No farm yet</AlertTitle>
          <AlertDescription>
            Create a farm first to analyze its crops.{" "}
            <Link to="/onboarding/farm" className="underline">
              Set up a farm
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              Upload crop photo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploader
              value={file}
              onChange={setFile}
              disabled={mutation.isPending}
            />
            <AnalysisProgress active={mutation.isPending} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="farm">Farm</Label>
              <Select value={farmId} onValueChange={setFarmId}>
                <SelectTrigger id="farm">
                  <SelectValue placeholder="Select farm" />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="crop">Crop type</Label>
              <input
                id="crop"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                placeholder="e.g. Tomato, Rice"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lang">Explanation language</Label>
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as typeof language)}
              >
                <SelectTrigger id="lang">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                  <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                  <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Only the explanation text changes — the AI prediction stays identical.
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={
                !file || !farmId || !configured || mutation.isPending
              }
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Analyzing…" : "Analyze Crop"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
