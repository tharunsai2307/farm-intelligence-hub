/**
 * Weather service — Phase 2 stub.
 *
 * Contract is finalized so callers can render real empty states today and
 * swap in a real provider (OpenWeather, Tomorrow.io, IMD, etc.) in Phase 2
 * without changing the UI surface.
 *
 * TODO(phase-2): Implement against a server-side weather provider.
 *   - Read OPENWEATHER_API_KEY from process.env inside a createServerFn handler.
 *   - Cache by (lat,lon,date) to respect provider rate limits.
 *   - Persist fetched values into public.weather_records.
 */
import { fail, NOT_CONFIGURED, type ServiceResult } from "./result";

export type WeatherSnapshot = {
  temperature: number;
  humidity: number;
  rain_probability: number;
  wind_speed: number;
  forecast_date: string;
  source: string;
  fetched_at: string;
};

export async function getCurrentWeatherByCoordinates(
  _latitude: number,
  _longitude: number,
): Promise<ServiceResult<WeatherSnapshot>> {
  return fail(NOT_CONFIGURED);
}

export async function getWeatherForecast(
  _latitude: number,
  _longitude: number,
): Promise<ServiceResult<WeatherSnapshot[]>> {
  return fail(NOT_CONFIGURED);
}

export async function getWeatherAlerts(
  _latitude: number,
  _longitude: number,
): Promise<ServiceResult<Array<{ title: string; severity: string; issued_at: string }>>> {
  return fail(NOT_CONFIGURED);
}
