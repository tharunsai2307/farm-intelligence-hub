/**
 * IoT sensor service — Phase 2 stub.
 *
 * TODO(phase-2): Ingest readings from LoRaWAN / NB-IoT / MQTT gateways and
 * persist into a sensor_readings table. Never fabricate sensor values.
 */
import { fail, NOT_CONFIGURED, type ServiceResult } from "./result";

export type SensorReading = {
  device_id: string;
  sensor_type: "soil_moisture" | "soil_temp" | "air_temp" | "humidity" | "rain" | string;
  value: number;
  unit: string;
  recorded_at: string;
  source: string;
};

export async function getLatestReadings(
  _farm_id: string,
): Promise<ServiceResult<SensorReading[]>> {
  return fail(NOT_CONFIGURED);
}

export async function ingestReading(
  _reading: SensorReading,
): Promise<ServiceResult<{ id: string }>> {
  return fail(NOT_CONFIGURED);
}
