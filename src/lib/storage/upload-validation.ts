/**
 * Client-side validation for crop-observation uploads.
 * The storage bucket is private and RLS-scoped; this is the user-friendly
 * pre-check that mirrors server-side limits.
 */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export function validateCropImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return "Only JPG, PNG, or WebP images are allowed.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "Image is larger than 5MB. Please choose a smaller file.";
  }
  return null;
}
