import { useCallback, useRef, useState } from "react";
import { Upload, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateCropImage, MAX_UPLOAD_BYTES } from "@/lib/storage/upload-validation";
import { toast } from "sonner";

export type ImageUploaderProps = {
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
};

export function ImageUploader({ value, onChange, disabled }: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const accept = useCallback(
    (file: File | null) => {
      if (!file) {
        onChange(null);
        setPreviewUrl(null);
        return;
      }
      const err = validateCropImage(file);
      if (err) {
        toast.error(err);
        return;
      }
      // Reject obviously tiny images (likely corrupted/thumbnails).
      if (file.size < 5 * 1024) {
        toast.error("Image looks too small or corrupted. Try another photo.");
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onChange(file);
    },
    [onChange],
  );

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files?.[0];
          if (f) accept(f);
        }}
        className={`relative flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:bg-muted/50"
        }`}
      >
        {value && previewUrl ? (
          <div className="relative w-full">
            <img
              src={previewUrl}
              alt="Selected crop"
              className="mx-auto max-h-[360px] rounded-lg object-contain"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute right-2 top-2"
              onClick={() => accept(null)}
              disabled={disabled}
            >
              <X className="mr-1 h-4 w-4" /> Remove
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {value.name} · {(value.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <>
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">Drop crop photo here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, or WebP · up to {Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={disabled}
              >
                <Upload className="mr-2 h-4 w-4" /> Browse
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cameraRef.current?.click()}
                disabled={disabled}
              >
                <Camera className="mr-2 h-4 w-4" /> Camera
              </Button>
            </div>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0] ?? null)}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => accept(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}
