export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          all_day: boolean
          created_at: string
          deleted_at: string | null
          description: string | null
          ends_at: string | null
          event_type: Database["public"]["Enums"]["calendar_event_type"]
          farm_id: string
          id: string
          related_harvest_id: string | null
          related_task_id: string | null
          starts_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          all_day?: boolean
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          ends_at?: string | null
          event_type?: Database["public"]["Enums"]["calendar_event_type"]
          farm_id: string
          id?: string
          related_harvest_id?: string | null
          related_task_id?: string | null
          starts_at: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          all_day?: boolean
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          ends_at?: string | null
          event_type?: Database["public"]["Enums"]["calendar_event_type"]
          farm_id?: string
          id?: string
          related_harvest_id?: string | null
          related_task_id?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_related_harvest_id_fkey"
            columns: ["related_harvest_id"]
            isOneToOne: false
            referencedRelation: "harvest_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_related_task_id_fkey"
            columns: ["related_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_analysis: {
        Row: {
          affected_area: number | null
          confidence: number | null
          created_at: string
          crop_type: string | null
          error_message: string | null
          explanation: string | null
          farm_id: string
          id: string
          image_path: string
          model_name: string
          model_version: string | null
          observation_id: string | null
          plot_id: string | null
          prediction: string | null
          processing_time_ms: number | null
          raw_response: Json | null
          recommendation: string | null
          scientific_name: string | null
          severity: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affected_area?: number | null
          confidence?: number | null
          created_at?: string
          crop_type?: string | null
          error_message?: string | null
          explanation?: string | null
          farm_id: string
          id?: string
          image_path: string
          model_name: string
          model_version?: string | null
          observation_id?: string | null
          plot_id?: string | null
          prediction?: string | null
          processing_time_ms?: number | null
          raw_response?: Json | null
          recommendation?: string | null
          scientific_name?: string | null
          severity?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affected_area?: number | null
          confidence?: number | null
          created_at?: string
          crop_type?: string | null
          error_message?: string | null
          explanation?: string | null
          farm_id?: string
          id?: string
          image_path?: string
          model_name?: string
          model_version?: string | null
          observation_id?: string | null
          plot_id?: string | null
          prediction?: string | null
          processing_time_ms?: number | null
          raw_response?: Json | null
          recommendation?: string | null
          scientific_name?: string | null
          severity?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_analysis_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_analysis_observation_id_fkey"
            columns: ["observation_id"]
            isOneToOne: false
            referencedRelation: "crop_observations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_analysis_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "farm_plots"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_disease_reference: {
        Row: {
          causes: string | null
          chemical_solution: string | null
          created_at: string
          description: string | null
          disease_key: string
          disease_name: string
          id: string
          organic_solution: string | null
          prevention: string | null
          reference_source: string | null
          scientific_name: string | null
          symptoms: string | null
          treatment: string | null
          updated_at: string
        }
        Insert: {
          causes?: string | null
          chemical_solution?: string | null
          created_at?: string
          description?: string | null
          disease_key: string
          disease_name: string
          id?: string
          organic_solution?: string | null
          prevention?: string | null
          reference_source?: string | null
          scientific_name?: string | null
          symptoms?: string | null
          treatment?: string | null
          updated_at?: string
        }
        Update: {
          causes?: string | null
          chemical_solution?: string | null
          created_at?: string
          description?: string | null
          disease_key?: string
          disease_name?: string
          id?: string
          organic_solution?: string | null
          prevention?: string | null
          reference_source?: string | null
          scientific_name?: string | null
          symptoms?: string | null
          treatment?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      crop_images: {
        Row: {
          captured_at: string
          created_at: string
          crop_id: string
          id: string
          storage_path: string
        }
        Insert: {
          captured_at?: string
          created_at?: string
          crop_id: string
          id?: string
          storage_path: string
        }
        Update: {
          captured_at?: string
          created_at?: string
          crop_id?: string
          id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_images_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_observations: {
        Row: {
          created_at: string
          crop_stage: string | null
          deleted_at: string | null
          farm_id: string
          id: string
          image_url: string | null
          notes: string | null
          plot_id: string | null
          recorded_at: string
          updated_at: string
          user_id: string
          visual_condition: string | null
        }
        Insert: {
          created_at?: string
          crop_stage?: string | null
          deleted_at?: string | null
          farm_id: string
          id?: string
          image_url?: string | null
          notes?: string | null
          plot_id?: string | null
          recorded_at?: string
          updated_at?: string
          user_id: string
          visual_condition?: string | null
        }
        Update: {
          created_at?: string
          crop_stage?: string | null
          deleted_at?: string | null
          farm_id?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          plot_id?: string | null
          recorded_at?: string
          updated_at?: string
          user_id?: string
          visual_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_observations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_observations_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "farm_plots"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          created_at: string
          deleted_at: string | null
          expected_harvest: string | null
          farm_id: string
          id: string
          name: string
          planted_on: string | null
          status: string
          updated_at: string
          variety: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          expected_harvest?: string | null
          farm_id: string
          id?: string
          name: string
          planted_on?: string | null
          status?: string
          updated_at?: string
          variety?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          expected_harvest?: string | null
          farm_id?: string
          id?: string
          name?: string
          planted_on?: string | null
          status?: string
          updated_at?: string
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crops_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      drone_surveys: {
        Row: {
          coverage_area: number | null
          coverage_area_unit: string | null
          created_at: string
          farm_id: string
          geojson_url: string | null
          id: string
          image_count: number
          metadata: Json
          notes: string | null
          orthomosaic_url: string | null
          pilot: string | null
          report_url: string | null
          status: Database["public"]["Enums"]["drone_survey_status"]
          survey_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coverage_area?: number | null
          coverage_area_unit?: string | null
          created_at?: string
          farm_id: string
          geojson_url?: string | null
          id?: string
          image_count?: number
          metadata?: Json
          notes?: string | null
          orthomosaic_url?: string | null
          pilot?: string | null
          report_url?: string | null
          status?: Database["public"]["Enums"]["drone_survey_status"]
          survey_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coverage_area?: number | null
          coverage_area_unit?: string | null
          created_at?: string
          farm_id?: string
          geojson_url?: string | null
          id?: string
          image_count?: number
          metadata?: Json
          notes?: string | null
          orthomosaic_url?: string | null
          pilot?: string | null
          report_url?: string | null
          status?: Database["public"]["Enums"]["drone_survey_status"]
          survey_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drone_surveys_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          created_at: string
          deleted_at: string | null
          farm_id: string
          id: string
          last_maintenance_date: string | null
          manufacturer: string | null
          name: string
          next_maintenance_date: string | null
          notes: string | null
          operating_hours: number | null
          purchase_date: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["equipment_status"]
          type: Database["public"]["Enums"]["equipment_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          farm_id: string
          id?: string
          last_maintenance_date?: string | null
          manufacturer?: string | null
          name: string
          next_maintenance_date?: string | null
          notes?: string | null
          operating_hours?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          type: Database["public"]["Enums"]["equipment_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          farm_id?: string
          id?: string
          last_maintenance_date?: string | null
          manufacturer?: string | null
          name?: string
          next_maintenance_date?: string | null
          notes?: string | null
          operating_hours?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["equipment_status"]
          type?: Database["public"]["Enums"]["equipment_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          currency: string
          deleted_at: string | null
          description: string | null
          expense_date: string
          farm_id: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          receipt_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          expense_date?: string
          farm_id: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          receipt_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string | null
          expense_date?: string
          farm_id?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          receipt_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_locations: {
        Row: {
          created_at: string
          farm_id: string
          geojson: Json | null
          id: string
          label: string | null
          latitude: number
          longitude: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          geojson?: Json | null
          id?: string
          label?: string | null
          latitude: number
          longitude: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          geojson?: Json | null
          id?: string
          label?: string | null
          latitude?: number
          longitude?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_locations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_plots: {
        Row: {
          area: number | null
          area_unit: string | null
          created_at: string
          crop: string | null
          crop_variety: string | null
          deleted_at: string | null
          farm_id: string
          id: string
          irrigation_type: string | null
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          soil_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: number | null
          area_unit?: string | null
          created_at?: string
          crop?: string | null
          crop_variety?: string | null
          deleted_at?: string | null
          farm_id: string
          id?: string
          irrigation_type?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          soil_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: number | null
          area_unit?: string | null
          created_at?: string
          crop?: string | null
          crop_variety?: string | null
          deleted_at?: string | null
          farm_id?: string
          id?: string
          irrigation_type?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          soil_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_plots_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_recommendations: {
        Row: {
          accepted: boolean
          confidence: string
          created_at: string
          dismissed: boolean
          farm_id: string
          id: string
          language: string
          plot_id: string | null
          reason: string
          recommendation: string
          recommendation_type: string
          source_modules: string[]
          status: string
          title: string
          translations: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted?: boolean
          confidence?: string
          created_at?: string
          dismissed?: boolean
          farm_id: string
          id?: string
          language?: string
          plot_id?: string | null
          reason: string
          recommendation: string
          recommendation_type: string
          source_modules?: string[]
          status?: string
          title: string
          translations?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted?: boolean
          confidence?: string
          created_at?: string
          dismissed?: boolean
          farm_id?: string
          id?: string
          language?: string
          plot_id?: string | null
          reason?: string
          recommendation?: string
          recommendation_type?: string
          source_modules?: string[]
          status?: string
          title?: string
          translations?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_recommendations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_recommendations_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "farm_plots"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          area_hectares: number | null
          area_unit: string | null
          country: string | null
          created_at: string
          crop_variety: string | null
          deleted_at: string | null
          district: string | null
          expected_harvest: string | null
          farm_type: string | null
          farming_season: string | null
          has_soil_sensors: boolean | null
          has_weather_station: boolean | null
          id: string
          irrigation_type: string | null
          name: string
          owner_id: string
          owner_name: string | null
          pincode: string | null
          planting_date: string | null
          primary_crop: string | null
          soil_type: string | null
          sowing_date: string | null
          state: string | null
          updated_at: string
          village: string | null
          wants_api_connection: boolean | null
          water_source: string | null
        }
        Insert: {
          area_hectares?: number | null
          area_unit?: string | null
          country?: string | null
          created_at?: string
          crop_variety?: string | null
          deleted_at?: string | null
          district?: string | null
          expected_harvest?: string | null
          farm_type?: string | null
          farming_season?: string | null
          has_soil_sensors?: boolean | null
          has_weather_station?: boolean | null
          id?: string
          irrigation_type?: string | null
          name: string
          owner_id: string
          owner_name?: string | null
          pincode?: string | null
          planting_date?: string | null
          primary_crop?: string | null
          soil_type?: string | null
          sowing_date?: string | null
          state?: string | null
          updated_at?: string
          village?: string | null
          wants_api_connection?: boolean | null
          water_source?: string | null
        }
        Update: {
          area_hectares?: number | null
          area_unit?: string | null
          country?: string | null
          created_at?: string
          crop_variety?: string | null
          deleted_at?: string | null
          district?: string | null
          expected_harvest?: string | null
          farm_type?: string | null
          farming_season?: string | null
          has_soil_sensors?: boolean | null
          has_weather_station?: boolean | null
          id?: string
          irrigation_type?: string | null
          name?: string
          owner_id?: string
          owner_name?: string | null
          pincode?: string | null
          planting_date?: string | null
          primary_crop?: string | null
          soil_type?: string | null
          sowing_date?: string | null
          state?: string | null
          updated_at?: string
          village?: string | null
          wants_api_connection?: boolean | null
          water_source?: string | null
        }
        Relationships: []
      }
      harvest_records: {
        Row: {
          actual_harvest_date: string | null
          actual_quantity: number | null
          buyer: string | null
          created_at: string
          crop: string
          deleted_at: string | null
          expected_harvest_date: string | null
          expected_quantity: number | null
          farm_id: string
          id: string
          notes: string | null
          plot_id: string | null
          status: Database["public"]["Enums"]["harvest_status"]
          storage_location: string | null
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_harvest_date?: string | null
          actual_quantity?: number | null
          buyer?: string | null
          created_at?: string
          crop: string
          deleted_at?: string | null
          expected_harvest_date?: string | null
          expected_quantity?: number | null
          farm_id: string
          id?: string
          notes?: string | null
          plot_id?: string | null
          status?: Database["public"]["Enums"]["harvest_status"]
          storage_location?: string | null
          unit?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_harvest_date?: string | null
          actual_quantity?: number | null
          buyer?: string | null
          created_at?: string
          crop?: string
          deleted_at?: string | null
          expected_harvest_date?: string | null
          expected_quantity?: number | null
          farm_id?: string
          id?: string
          notes?: string | null
          plot_id?: string | null
          status?: Database["public"]["Enums"]["harvest_status"]
          storage_location?: string | null
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "harvest_records_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvest_records_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "farm_plots"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: Database["public"]["Enums"]["inventory_category"]
          cost: number | null
          created_at: string
          deleted_at: string | null
          expiry_date: string | null
          farm_id: string
          id: string
          min_stock_level: number | null
          name: string
          notes: string | null
          purchase_date: string | null
          quantity: number
          storage_location: string | null
          supplier: string | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["inventory_category"]
          cost?: number | null
          created_at?: string
          deleted_at?: string | null
          expiry_date?: string | null
          farm_id: string
          id?: string
          min_stock_level?: number | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          quantity?: number
          storage_location?: string | null
          supplier?: string | null
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["inventory_category"]
          cost?: number | null
          created_at?: string
          deleted_at?: string | null
          expiry_date?: string | null
          farm_id?: string
          id?: string
          min_stock_level?: number | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          quantity?: number
          storage_location?: string | null
          supplier?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      irrigation_records: {
        Row: {
          created_at: string
          deleted_at: string | null
          duration_minutes: number | null
          ended_at: string | null
          energy_used: number | null
          farm_id: string
          id: string
          method: string | null
          notes: string | null
          plot_id: string | null
          started_at: string
          updated_at: string
          user_id: string | null
          volume_liters: number | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          energy_used?: number | null
          farm_id: string
          id?: string
          method?: string | null
          notes?: string | null
          plot_id?: string | null
          started_at?: string
          updated_at?: string
          user_id?: string | null
          volume_liters?: number | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          energy_used?: number | null
          farm_id?: string
          id?: string
          method?: string | null
          notes?: string | null
          plot_id?: string | null
          started_at?: string
          updated_at?: string
          user_id?: string | null
          volume_liters?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "irrigation_records_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "irrigation_records_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "farm_plots"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          district: string | null
          email: string | null
          full_name: string | null
          id: string
          language: string
          location: string | null
          onboarded: boolean
          phone: string | null
          preferred_language: string | null
          state: string | null
          updated_at: string
          user_role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          district?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          language?: string
          location?: string | null
          onboarded?: boolean
          phone?: string | null
          preferred_language?: string | null
          state?: string | null
          updated_at?: string
          user_role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          district?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string
          location?: string | null
          onboarded?: boolean
          phone?: string | null
          preferred_language?: string | null
          state?: string | null
          updated_at?: string
          user_role?: string | null
        }
        Relationships: []
      }
      satellite_records: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          image_date: string
          image_url: string | null
          metadata: Json
          moisture_index: number | null
          ndvi: number | null
          provider: string
          resolution: string | null
          user_id: string
          vegetation_index: number | null
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          image_date: string
          image_url?: string | null
          metadata?: Json
          moisture_index?: number | null
          ndvi?: number | null
          provider: string
          resolution?: string | null
          user_id: string
          vegetation_index?: number | null
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          image_date?: string
          image_url?: string | null
          metadata?: Json
          moisture_index?: number | null
          ndvi?: number | null
          provider?: string
          resolution?: string | null
          user_id?: string
          vegetation_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "satellite_records_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_devices: {
        Row: {
          battery_level: number | null
          created_at: string
          device_name: string
          device_type: Database["public"]["Enums"]["sensor_device_type"]
          farm_id: string
          firmware_version: string | null
          id: string
          last_seen: string | null
          manufacturer: string | null
          metadata: Json
          plot_id: string | null
          serial_number: string | null
          status: Database["public"]["Enums"]["sensor_device_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          battery_level?: number | null
          created_at?: string
          device_name: string
          device_type?: Database["public"]["Enums"]["sensor_device_type"]
          farm_id: string
          firmware_version?: string | null
          id?: string
          last_seen?: string | null
          manufacturer?: string | null
          metadata?: Json
          plot_id?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["sensor_device_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          battery_level?: number | null
          created_at?: string
          device_name?: string
          device_type?: Database["public"]["Enums"]["sensor_device_type"]
          farm_id?: string
          firmware_version?: string | null
          id?: string
          last_seen?: string | null
          manufacturer?: string | null
          metadata?: Json
          plot_id?: string | null
          serial_number?: string | null
          status?: Database["public"]["Enums"]["sensor_device_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensor_devices_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_devices_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "farm_plots"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          created_at: string
          device_id: string
          farm_id: string
          id: string
          metadata: Json
          plot_id: string | null
          recorded_at: string
          sensor_type: string
          unit: string | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          device_id: string
          farm_id: string
          id?: string
          metadata?: Json
          plot_id?: string | null
          recorded_at?: string
          sensor_type: string
          unit?: string | null
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          device_id?: string
          farm_id?: string
          id?: string
          metadata?: Json
          plot_id?: string | null
          recorded_at?: string
          sensor_type?: string
          unit?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "sensor_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_readings_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_readings_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "farm_plots"
            referencedColumns: ["id"]
          },
        ]
      }
      soil_records: {
        Row: {
          created_at: string
          deleted_at: string | null
          farm_id: string
          id: string
          moisture: number | null
          nitrogen: number | null
          notes: string | null
          organic_matter: number | null
          ph: number | null
          phosphorus: number | null
          plot_id: string | null
          potassium: number | null
          recorded_at: string
          temperature: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          farm_id: string
          id?: string
          moisture?: number | null
          nitrogen?: number | null
          notes?: string | null
          organic_matter?: number | null
          ph?: number | null
          phosphorus?: number | null
          plot_id?: string | null
          potassium?: number | null
          recorded_at?: string
          temperature?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          farm_id?: string
          id?: string
          moisture?: number | null
          nitrogen?: number | null
          notes?: string | null
          organic_matter?: number | null
          ph?: number | null
          phosphorus?: number | null
          plot_id?: string | null
          potassium?: number | null
          recorded_at?: string
          temperature?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "soil_records_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soil_records_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "farm_plots"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          completion_notes: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          due_date: string | null
          farm_id: string
          id: string
          plot_id: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          progress: number
          source_recommendation_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at: string
          user_id: string
          worker_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          farm_id: string
          id?: string
          plot_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          progress?: number
          source_recommendation_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at?: string
          user_id: string
          worker_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          farm_id?: string
          id?: string
          plot_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          progress?: number
          source_recommendation_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          updated_at?: string
          user_id?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "farm_plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_source_recommendation_id_fkey"
            columns: ["source_recommendation_id"]
            isOneToOne: false
            referencedRelation: "farm_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          language: string
          notif_email: boolean
          notif_push: boolean
          privacy_share_analytics: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          language?: string
          notif_email?: boolean
          notif_push?: boolean
          privacy_share_analytics?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          language?: string
          notif_email?: boolean
          notif_push?: boolean
          privacy_share_analytics?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weather_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string | null
          ends_at: string | null
          farm_id: string
          id: string
          severity: string
          source: string
          starts_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          farm_id: string
          id?: string
          severity: string
          source?: string
          starts_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          farm_id?: string
          id?: string
          severity?: string
          source?: string
          starts_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weather_alerts_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_forecasts: {
        Row: {
          created_at: string
          farm_id: string
          fetched_at: string
          forecast_date: string
          humidity: number | null
          id: string
          max_temp: number | null
          min_temp: number | null
          rain_probability: number | null
          rainfall: number | null
          source: string
          updated_at: string
          user_id: string
          weather_condition: string | null
          wind_speed: number | null
        }
        Insert: {
          created_at?: string
          farm_id: string
          fetched_at?: string
          forecast_date: string
          humidity?: number | null
          id?: string
          max_temp?: number | null
          min_temp?: number | null
          rain_probability?: number | null
          rainfall?: number | null
          source?: string
          updated_at?: string
          user_id: string
          weather_condition?: string | null
          wind_speed?: number | null
        }
        Update: {
          created_at?: string
          farm_id?: string
          fetched_at?: string
          forecast_date?: string
          humidity?: number | null
          id?: string
          max_temp?: number | null
          min_temp?: number | null
          rain_probability?: number | null
          rainfall?: number | null
          source?: string
          updated_at?: string
          user_id?: string
          weather_condition?: string | null
          wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_forecasts_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_records: {
        Row: {
          created_at: string
          farm_id: string
          fetched_at: string
          humidity: number | null
          id: string
          latitude: number | null
          longitude: number | null
          pressure: number | null
          rainfall_mm: number | null
          recorded_at: string
          source: string | null
          temp_c: number | null
          updated_at: string
          user_id: string | null
          uv_index: number | null
          weather_condition: string | null
          wind_kph: number | null
        }
        Insert: {
          created_at?: string
          farm_id: string
          fetched_at?: string
          humidity?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          pressure?: number | null
          rainfall_mm?: number | null
          recorded_at?: string
          source?: string | null
          temp_c?: number | null
          updated_at?: string
          user_id?: string | null
          uv_index?: number | null
          weather_condition?: string | null
          wind_kph?: number | null
        }
        Update: {
          created_at?: string
          farm_id?: string
          fetched_at?: string
          humidity?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          pressure?: number | null
          rainfall_mm?: number | null
          recorded_at?: string
          source?: string | null
          temp_c?: number | null
          updated_at?: string
          user_id?: string | null
          uv_index?: number | null
          weather_condition?: string | null
          wind_kph?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_records_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_attendance: {
        Row: {
          created_at: string
          date: string
          hours_worked: number | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          updated_at: string
          user_id: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          date: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          user_id: string
          worker_id: string
        }
        Update: {
          created_at?: string
          date?: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          updated_at?: string
          user_id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_attendance_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          available: boolean
          created_at: string
          daily_wage: number | null
          deleted_at: string | null
          farm_id: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          daily_wage?: number | null
          deleted_at?: string | null
          farm_id: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available?: boolean
          created_at?: string
          daily_wage?: number | null
          deleted_at?: string | null
          farm_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workers_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owns_farm: { Args: { _farm_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "agronomist" | "farmer"
      attendance_status: "present" | "absent" | "half_day" | "leave"
      calendar_event_type:
        | "task"
        | "harvest"
        | "maintenance"
        | "weather"
        | "observation"
        | "irrigation"
        | "custom"
      drone_survey_status:
        | "planned"
        | "in_progress"
        | "completed"
        | "failed"
        | "cancelled"
      equipment_status: "operational" | "maintenance_due" | "out_of_service"
      equipment_type:
        | "tractor"
        | "pump_set"
        | "drip_system"
        | "sprayer"
        | "harvest_machine"
        | "sensor"
        | "other"
      expense_category:
        | "seeds"
        | "labor"
        | "fuel"
        | "water"
        | "electricity"
        | "equipment"
        | "maintenance"
        | "transport"
        | "other"
      harvest_status:
        | "planned"
        | "in_progress"
        | "completed"
        | "sold"
        | "cancelled"
      inventory_category:
        | "seeds"
        | "fertilizers"
        | "pesticides"
        | "organic_inputs"
        | "tools"
        | "spare_parts"
        | "storage_materials"
        | "other"
      payment_method:
        | "cash"
        | "bank_transfer"
        | "upi"
        | "card"
        | "credit"
        | "other"
      sensor_device_status:
        | "online"
        | "offline"
        | "low_battery"
        | "maintenance"
        | "unknown"
      sensor_device_type:
        | "esp32"
        | "arduino"
        | "lora"
        | "mqtt"
        | "weather_station"
        | "soil_probe"
        | "camera"
        | "other"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      task_type:
        | "irrigation"
        | "spraying"
        | "harvest"
        | "inspection"
        | "fertilizer_application"
        | "maintenance"
        | "manual_work"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "agronomist", "farmer"],
      attendance_status: ["present", "absent", "half_day", "leave"],
      calendar_event_type: [
        "task",
        "harvest",
        "maintenance",
        "weather",
        "observation",
        "irrigation",
        "custom",
      ],
      drone_survey_status: [
        "planned",
        "in_progress",
        "completed",
        "failed",
        "cancelled",
      ],
      equipment_status: ["operational", "maintenance_due", "out_of_service"],
      equipment_type: [
        "tractor",
        "pump_set",
        "drip_system",
        "sprayer",
        "harvest_machine",
        "sensor",
        "other",
      ],
      expense_category: [
        "seeds",
        "labor",
        "fuel",
        "water",
        "electricity",
        "equipment",
        "maintenance",
        "transport",
        "other",
      ],
      harvest_status: [
        "planned",
        "in_progress",
        "completed",
        "sold",
        "cancelled",
      ],
      inventory_category: [
        "seeds",
        "fertilizers",
        "pesticides",
        "organic_inputs",
        "tools",
        "spare_parts",
        "storage_materials",
        "other",
      ],
      payment_method: [
        "cash",
        "bank_transfer",
        "upi",
        "card",
        "credit",
        "other",
      ],
      sensor_device_status: [
        "online",
        "offline",
        "low_battery",
        "maintenance",
        "unknown",
      ],
      sensor_device_type: [
        "esp32",
        "arduino",
        "lora",
        "mqtt",
        "weather_station",
        "soil_probe",
        "camera",
        "other",
      ],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      task_type: [
        "irrigation",
        "spraying",
        "harvest",
        "inspection",
        "fertilizer_application",
        "maintenance",
        "manual_work",
        "other",
      ],
    },
  },
} as const
