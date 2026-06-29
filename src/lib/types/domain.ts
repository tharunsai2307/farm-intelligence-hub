/**
 * Shared domain types — strongly typed views of public.* tables.
 * These mirror the Supabase schema and are imported by services and UI.
 */

export type UUID = string;
export type ISODate = string;

export type UserProfile = {
  id: UUID;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  preferred_language: string | null;
  state: string | null;
  district: string | null;
  user_role: string | null;
  created_at: ISODate;
  updated_at: ISODate;
};

export type Farm = {
  id: UUID;
  owner_id: UUID;
  name: string;
  area_hectares: number | null;
  area_unit: string | null;
  soil_type: string | null;
  irrigation_type: string | null;
  water_source: string | null;
  created_at: ISODate;
  updated_at: ISODate;
  deleted_at: ISODate | null;
};

export type FarmLocation = {
  id: UUID;
  farm_id: UUID;
  label: string | null;
  latitude: number;
  longitude: number;
  geojson: unknown | null;
  created_at: ISODate;
  updated_at: ISODate;
};

export type FarmPlot = {
  id: UUID;
  farm_id: UUID;
  user_id: UUID;
  name: string;
  crop: string | null;
  crop_variety: string | null;
  area: number | null;
  area_unit: string | null;
  soil_type: string | null;
  irrigation_type: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  created_at: ISODate;
  updated_at: ISODate;
  deleted_at: ISODate | null;
};

export type SoilRecordRow = {
  id: UUID;
  farm_id: UUID;
  plot_id: UUID | null;
  user_id: UUID;
  recorded_at: ISODate;
  ph: number | null;
  moisture: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  organic_matter: number | null;
  temperature: number | null;
  notes: string | null;
  created_at: ISODate;
};

export type IrrigationRecordRow = {
  id: UUID;
  farm_id: UUID;
  plot_id: UUID | null;
  user_id: UUID;
  started_at: ISODate;
  ended_at: ISODate | null;
  volume_liters: number | null;
  duration_minutes: number | null;
  method: string | null;
  energy_used: number | null;
  notes: string | null;
  created_at: ISODate;
};

export type CropObservationRow = {
  id: UUID;
  farm_id: UUID;
  plot_id: UUID | null;
  user_id: UUID;
  recorded_at: ISODate;
  crop_stage: string | null;
  visual_condition: string | null;
  notes: string | null;
  image_url: string | null;
  created_at: ISODate;
};

export type Notification = {
  id: UUID;
  user_id: UUID;
  title: string;
  body: string | null;
  category: string | null;
  read_at: ISODate | null;
  created_at: ISODate;
};

export type Settings = {
  user_id: UUID;
  theme: "light" | "dark" | "system";
  language: string;
  notifications_enabled: boolean;
  created_at: ISODate;
  updated_at: ISODate;
};

export type DataAvailabilityStatus = {
  has_profile: boolean;
  has_farm: boolean;
  has_location: boolean;
  has_plot: boolean;
  has_soil_record: boolean;
  has_irrigation_record: boolean;
  has_crop_observation: boolean;
};

export type DashboardSummary = {
  farm_count: number;
  plot_count: number;
  soil_count: number;
  irrigation_count: number;
  observation_count: number;
  last_activity_at: ISODate | null;
  setup_completion_percent: number;
};

export type RecentActivityItem = {
  type:
    | "farm_created"
    | "farm_updated"
    | "plot_created"
    | "plot_updated"
    | "soil_record_created"
    | "irrigation_record_created"
    | "crop_observation_created"
    | "crop_image_uploaded"
    | "location_updated";
  ref_id: UUID;
  occurred_at: ISODate;
  label: string;
};
