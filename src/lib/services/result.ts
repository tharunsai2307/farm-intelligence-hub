/**
 * Shared service-result envelope.
 *
 * Future Phase 2 services (weather, AI, IoT, etc.) return ServiceResult<T>
 * so the UI can render predictable success / error / not-configured states
 * without ever exposing raw provider errors.
 */
export type ServiceResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

export const ok = <T>(data: T): ServiceResult<T> => ({
  success: true,
  data,
  error: null,
});

export const fail = <T = never>(error: string): ServiceResult<T> => ({
  success: false,
  data: null,
  error,
});

export const NOT_CONFIGURED = "Service not configured.";
