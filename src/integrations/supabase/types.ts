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
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          ip_address: string | null
          payload: Json | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          payload?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          payload?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      buyer_profiles: {
        Row: {
          bio: string | null
          business_name: string
          business_type: string | null
          city: string | null
          created_at: string
          district: string | null
          gstin: string | null
          id: string
          phone: string | null
          preferred_commodities: string[] | null
          state: string | null
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          bio?: string | null
          business_name: string
          business_type?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          gstin?: string | null
          id?: string
          phone?: string | null
          preferred_commodities?: string[] | null
          state?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          bio?: string | null
          business_name?: string
          business_type?: string | null
          city?: string | null
          created_at?: string
          district?: string | null
          gstin?: string | null
          id?: string
          phone?: string | null
          preferred_commodities?: string[] | null
          state?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
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
      carbon_records: {
        Row: {
          activity: string | null
          created_at: string
          created_by: string | null
          details: Json | null
          emissions_kg_co2e: number
          farm_id: string
          id: string
          occurred_on: string
          quantity: number | null
          sequestration_kg_co2e: number
          source: Database["public"]["Enums"]["carbon_source"]
          unit: string | null
          updated_at: string
        }
        Insert: {
          activity?: string | null
          created_at?: string
          created_by?: string | null
          details?: Json | null
          emissions_kg_co2e?: number
          farm_id: string
          id?: string
          occurred_on: string
          quantity?: number | null
          sequestration_kg_co2e?: number
          source: Database["public"]["Enums"]["carbon_source"]
          unit?: string | null
          updated_at?: string
        }
        Update: {
          activity?: string | null
          created_at?: string
          created_by?: string | null
          details?: Json | null
          emissions_kg_co2e?: number
          farm_id?: string
          id?: string
          occurred_on?: string
          quantity?: number | null
          sequestration_kg_co2e?: number
          source?: Database["public"]["Enums"]["carbon_source"]
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carbon_records_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
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
      farm_collaborators: {
        Row: {
          accepted_at: string
          created_at: string
          farm_id: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["collaborator_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          farm_id: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["collaborator_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          farm_id?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["collaborator_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_collaborators_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          farm_id: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["collaborator_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          farm_id: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["collaborator_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          farm_id?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["collaborator_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_invitations_farm_id_fkey"
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
      government_schemes: {
        Row: {
          active: boolean
          agency: string | null
          application_url: string | null
          benefits: string | null
          category: Database["public"]["Enums"]["scheme_category"]
          created_at: string
          description: string | null
          documents_required: string[] | null
          eligibility: Json | null
          external_id: string | null
          helpline: string | null
          id: string
          last_synced_at: string
          level: string | null
          name: string
          source: string
          state: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          agency?: string | null
          application_url?: string | null
          benefits?: string | null
          category?: Database["public"]["Enums"]["scheme_category"]
          created_at?: string
          description?: string | null
          documents_required?: string[] | null
          eligibility?: Json | null
          external_id?: string | null
          helpline?: string | null
          id?: string
          last_synced_at?: string
          level?: string | null
          name: string
          source?: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          agency?: string | null
          application_url?: string | null
          benefits?: string | null
          category?: Database["public"]["Enums"]["scheme_category"]
          created_at?: string
          description?: string | null
          documents_required?: string[] | null
          eligibility?: Json | null
          external_id?: string | null
          helpline?: string | null
          id?: string
          last_synced_at?: string
          level?: string | null
          name?: string
          source?: string
          state?: string | null
          updated_at?: string
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
      insurance_policies: {
        Row: {
          created_at: string
          crop: string | null
          end_date: string | null
          farm_id: string
          id: string
          notes: string | null
          policy_no: string | null
          premium_paid: number | null
          product_id: string | null
          season: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["application_status"]
          sum_insured: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crop?: string | null
          end_date?: string | null
          farm_id: string
          id?: string
          notes?: string | null
          policy_no?: string | null
          premium_paid?: number | null
          product_id?: string | null
          season?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          sum_insured?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crop?: string | null
          end_date?: string | null
          farm_id?: string
          id?: string
          notes?: string | null
          policy_no?: string | null
          premium_paid?: number | null
          product_id?: string | null
          season?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          sum_insured?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_policies_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_policies_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "insurance_products"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_products: {
        Row: {
          active: boolean
          application_url: string | null
          coverage_details: string | null
          created_at: string
          crops_covered: string[] | null
          documents_required: string[] | null
          id: string
          name: string
          premium_rate_pct: number | null
          provider: string
          scheme_code: string | null
          source: string
          states_covered: string[] | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          application_url?: string | null
          coverage_details?: string | null
          created_at?: string
          crops_covered?: string[] | null
          documents_required?: string[] | null
          id?: string
          name: string
          premium_rate_pct?: number | null
          provider: string
          scheme_code?: string | null
          source?: string
          states_covered?: string[] | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          application_url?: string | null
          coverage_details?: string | null
          created_at?: string
          crops_covered?: string[] | null
          documents_required?: string[] | null
          id?: string
          name?: string
          premium_rate_pct?: number | null
          provider?: string
          scheme_code?: string | null
          source?: string
          states_covered?: string[] | null
          updated_at?: string
        }
        Relationships: []
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
      loan_applications: {
        Row: {
          created_at: string
          farm_id: string | null
          id: string
          loan_product_id: string
          notes: string | null
          purpose: string | null
          reference_no: string | null
          requested_amount: number
          status: Database["public"]["Enums"]["application_status"]
          tenure_months: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          farm_id?: string | null
          id?: string
          loan_product_id: string
          notes?: string | null
          purpose?: string | null
          reference_no?: string | null
          requested_amount: number
          status?: Database["public"]["Enums"]["application_status"]
          tenure_months?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          farm_id?: string | null
          id?: string
          loan_product_id?: string
          notes?: string | null
          purpose?: string | null
          reference_no?: string | null
          requested_amount?: number
          status?: Database["public"]["Enums"]["application_status"]
          tenure_months?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_applications_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_applications_loan_product_id_fkey"
            columns: ["loan_product_id"]
            isOneToOne: false
            referencedRelation: "loan_products"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_products: {
        Row: {
          active: boolean
          application_url: string | null
          created_at: string
          description: string | null
          documents_required: string[] | null
          eligibility: Json | null
          id: string
          interest_rate_max: number | null
          interest_rate_min: number | null
          lender: string
          loan_type: string
          max_amount: number | null
          min_amount: number | null
          name: string
          source: string
          tenure_months_max: number | null
          tenure_months_min: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          application_url?: string | null
          created_at?: string
          description?: string | null
          documents_required?: string[] | null
          eligibility?: Json | null
          id?: string
          interest_rate_max?: number | null
          interest_rate_min?: number | null
          lender: string
          loan_type: string
          max_amount?: number | null
          min_amount?: number | null
          name: string
          source?: string
          tenure_months_max?: number | null
          tenure_months_min?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          application_url?: string | null
          created_at?: string
          description?: string | null
          documents_required?: string[] | null
          eligibility?: Json | null
          id?: string
          interest_rate_max?: number | null
          interest_rate_min?: number | null
          lender?: string
          loan_type?: string
          max_amount?: number | null
          min_amount?: number | null
          name?: string
          source?: string
          tenure_months_max?: number | null
          tenure_months_min?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      logistics_plans: {
        Row: {
          carrier_name: string | null
          carrier_phone: string | null
          created_at: string
          created_by: string
          distance_km: number | null
          dropoff_address: string
          dropoff_lat: number | null
          dropoff_lng: number | null
          estimated_cost: number | null
          farm_id: string
          id: string
          order_id: string | null
          pickup_address: string
          pickup_lat: number | null
          pickup_lng: number | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["logistics_status"]
          updated_at: string
          vehicle_type: string | null
          weight_kg: number | null
        }
        Insert: {
          carrier_name?: string | null
          carrier_phone?: string | null
          created_at?: string
          created_by: string
          distance_km?: number | null
          dropoff_address: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          estimated_cost?: number | null
          farm_id: string
          id?: string
          order_id?: string | null
          pickup_address: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["logistics_status"]
          updated_at?: string
          vehicle_type?: string | null
          weight_kg?: number | null
        }
        Update: {
          carrier_name?: string | null
          carrier_phone?: string | null
          created_at?: string
          created_by?: string
          distance_km?: number | null
          dropoff_address?: string
          dropoff_lat?: number | null
          dropoff_lng?: number | null
          estimated_cost?: number | null
          farm_id?: string
          id?: string
          order_id?: string | null
          pickup_address?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["logistics_status"]
          updated_at?: string
          vehicle_type?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "logistics_plans_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logistics_plans_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      market_prices: {
        Row: {
          arrival_date: string
          commodity: string
          created_at: string
          district: string | null
          grade: string | null
          id: string
          market: string
          max_price: number | null
          min_price: number | null
          modal_price: number | null
          raw: Json | null
          source: string
          state: string
          unit: string
          variety: string | null
        }
        Insert: {
          arrival_date: string
          commodity: string
          created_at?: string
          district?: string | null
          grade?: string | null
          id?: string
          market: string
          max_price?: number | null
          min_price?: number | null
          modal_price?: number | null
          raw?: Json | null
          source?: string
          state: string
          unit?: string
          variety?: string | null
        }
        Update: {
          arrival_date?: string
          commodity?: string
          created_at?: string
          district?: string | null
          grade?: string | null
          id?: string
          market?: string
          max_price?: number | null
          min_price?: number | null
          modal_price?: number | null
          raw?: Json | null
          source?: string
          state?: string
          unit?: string
          variety?: string | null
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          available_from: string | null
          available_until: string | null
          commodity: string
          created_at: string
          currency: string
          description: string | null
          farm_id: string
          grade: string | null
          harvest_date: string | null
          id: string
          image_urls: string[] | null
          owner_id: string
          pickup_address: string | null
          pickup_district: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          pickup_state: string | null
          price_per_unit: number
          quantity: number
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          unit: string
          updated_at: string
          variety: string | null
          views_count: number
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          commodity: string
          created_at?: string
          currency?: string
          description?: string | null
          farm_id: string
          grade?: string | null
          harvest_date?: string | null
          id?: string
          image_urls?: string[] | null
          owner_id: string
          pickup_address?: string | null
          pickup_district?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_state?: string | null
          price_per_unit: number
          quantity: number
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          unit?: string
          updated_at?: string
          variety?: string | null
          views_count?: number
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          commodity?: string
          created_at?: string
          currency?: string
          description?: string | null
          farm_id?: string
          grade?: string | null
          harvest_date?: string | null
          id?: string
          image_urls?: string[] | null
          owner_id?: string
          pickup_address?: string | null
          pickup_district?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_state?: string | null
          price_per_unit?: number
          quantity?: number
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          unit?: string
          updated_at?: string
          variety?: string | null
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_orders: {
        Row: {
          buyer_id: string
          created_at: string
          currency: string
          delivery_address: string | null
          delivery_date: string | null
          delivery_district: string | null
          delivery_state: string | null
          farm_id: string
          id: string
          listing_id: string
          notes: string | null
          quantity: number
          seller_id: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          unit: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          currency?: string
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_district?: string | null
          delivery_state?: string | null
          farm_id: string
          id?: string
          listing_id: string
          notes?: string | null
          quantity: number
          seller_id: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          unit: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          currency?: string
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_district?: string | null
          delivery_state?: string | null
          farm_id?: string
          id?: string
          listing_id?: string
          notes?: string | null
          quantity?: number
          seller_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
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
      push_subscriptions: {
        Row: {
          active: boolean
          auth: string
          created_at: string
          device_label: string | null
          endpoint: string
          id: string
          last_used_at: string | null
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          auth: string
          created_at?: string
          device_label?: string | null
          endpoint: string
          id?: string
          last_used_at?: string | null
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          auth?: string
          created_at?: string
          device_label?: string | null
          endpoint?: string
          id?: string
          last_used_at?: string | null
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
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
      scheme_applications: {
        Row: {
          created_at: string
          decided_at: string | null
          farm_id: string | null
          id: string
          notes: string | null
          reference_no: string | null
          scheme_id: string
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          farm_id?: string | null
          id?: string
          notes?: string | null
          reference_no?: string | null
          scheme_id: string
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          farm_id?: string | null
          id?: string
          notes?: string | null
          reference_no?: string | null
          scheme_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheme_applications_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheme_applications_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "government_schemes"
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
      sustainability_scores: {
        Row: {
          biodiversity_score: number | null
          breakdown: Json | null
          carbon_score: number | null
          computed_by: string
          created_at: string
          farm_id: string
          id: string
          overall_score: number
          period_end: string
          period_start: string
          rating: string | null
          soil_score: number | null
          updated_at: string
          water_score: number | null
        }
        Insert: {
          biodiversity_score?: number | null
          breakdown?: Json | null
          carbon_score?: number | null
          computed_by?: string
          created_at?: string
          farm_id: string
          id?: string
          overall_score: number
          period_end: string
          period_start: string
          rating?: string | null
          soil_score?: number | null
          updated_at?: string
          water_score?: number | null
        }
        Update: {
          biodiversity_score?: number | null
          breakdown?: Json | null
          carbon_score?: number | null
          computed_by?: string
          created_at?: string
          farm_id?: string
          id?: string
          overall_score?: number
          period_end?: string
          period_start?: string
          rating?: string | null
          soil_score?: number | null
          updated_at?: string
          water_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sustainability_scores_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
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
      warehouse_bookings: {
        Row: {
          commodity: string
          created_at: string
          currency: string
          end_date: string
          farm_id: string | null
          id: string
          notes: string | null
          quantity_kg: number
          rate_per_kg_per_day: number
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          total_cost: number
          updated_at: string
          user_id: string
          warehouse_id: string
        }
        Insert: {
          commodity: string
          created_at?: string
          currency?: string
          end_date: string
          farm_id?: string | null
          id?: string
          notes?: string | null
          quantity_kg: number
          rate_per_kg_per_day: number
          start_date: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_cost: number
          updated_at?: string
          user_id: string
          warehouse_id: string
        }
        Update: {
          commodity?: string
          created_at?: string
          currency?: string
          end_date?: string
          farm_id?: string | null
          id?: string
          notes?: string | null
          quantity_kg?: number
          rate_per_kg_per_day?: number
          start_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_cost?: number
          updated_at?: string
          user_id?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_bookings_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_bookings_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          active: boolean
          address: string
          available_kg: number
          capacity_kg: number
          contact_phone: string | null
          created_at: string
          currency: string
          description: string | null
          district: string | null
          features: string[] | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          owner_id: string
          pincode: string | null
          rate_per_kg_per_day: number
          state: string
          type: Database["public"]["Enums"]["warehouse_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          address: string
          available_kg: number
          capacity_kg: number
          contact_phone?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          district?: string | null
          features?: string[] | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          owner_id: string
          pincode?: string | null
          rate_per_kg_per_day?: number
          state: string
          type?: Database["public"]["Enums"]["warehouse_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string
          available_kg?: number
          capacity_kg?: number
          contact_phone?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          district?: string | null
          features?: string[] | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          owner_id?: string
          pincode?: string | null
          rate_per_kg_per_day?: number
          state?: string
          type?: Database["public"]["Enums"]["warehouse_type"]
          updated_at?: string
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
      can_access_farm: { Args: { _farm_id: string }; Returns: boolean }
      can_manage_farm: { Args: { _farm_id: string }; Returns: boolean }
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
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "disbursed"
        | "closed"
      attendance_status: "present" | "absent" | "half_day" | "leave"
      booking_status:
        | "pending"
        | "confirmed"
        | "active"
        | "completed"
        | "cancelled"
      calendar_event_type:
        | "task"
        | "harvest"
        | "maintenance"
        | "weather"
        | "observation"
        | "irrigation"
        | "custom"
      carbon_source:
        | "fertilizer"
        | "fuel"
        | "electricity"
        | "irrigation"
        | "livestock"
        | "residue_burning"
        | "sequestration_cover"
        | "sequestration_trees"
        | "sequestration_soil"
        | "other"
      collaborator_role: "manager" | "worker" | "viewer"
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
      invitation_status: "pending" | "accepted" | "revoked" | "expired"
      listing_status: "draft" | "active" | "sold" | "withdrawn" | "expired"
      logistics_status:
        | "planned"
        | "dispatched"
        | "in_transit"
        | "delivered"
        | "cancelled"
      order_status:
        | "pending"
        | "confirmed"
        | "in_transit"
        | "delivered"
        | "cancelled"
        | "disputed"
      payment_method:
        | "cash"
        | "bank_transfer"
        | "upi"
        | "card"
        | "credit"
        | "other"
      scheme_category:
        | "subsidy"
        | "insurance"
        | "credit"
        | "equipment"
        | "irrigation"
        | "training"
        | "market_support"
        | "sustainability"
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
      warehouse_type:
        | "cold_storage"
        | "dry_storage"
        | "silo"
        | "open_yard"
        | "controlled_atmosphere"
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
      application_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "disbursed",
        "closed",
      ],
      attendance_status: ["present", "absent", "half_day", "leave"],
      booking_status: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
      ],
      calendar_event_type: [
        "task",
        "harvest",
        "maintenance",
        "weather",
        "observation",
        "irrigation",
        "custom",
      ],
      carbon_source: [
        "fertilizer",
        "fuel",
        "electricity",
        "irrigation",
        "livestock",
        "residue_burning",
        "sequestration_cover",
        "sequestration_trees",
        "sequestration_soil",
        "other",
      ],
      collaborator_role: ["manager", "worker", "viewer"],
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
      invitation_status: ["pending", "accepted", "revoked", "expired"],
      listing_status: ["draft", "active", "sold", "withdrawn", "expired"],
      logistics_status: [
        "planned",
        "dispatched",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      order_status: [
        "pending",
        "confirmed",
        "in_transit",
        "delivered",
        "cancelled",
        "disputed",
      ],
      payment_method: [
        "cash",
        "bank_transfer",
        "upi",
        "card",
        "credit",
        "other",
      ],
      scheme_category: [
        "subsidy",
        "insurance",
        "credit",
        "equipment",
        "irrigation",
        "training",
        "market_support",
        "sustainability",
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
      warehouse_type: [
        "cold_storage",
        "dry_storage",
        "silo",
        "open_yard",
        "controlled_atmosphere",
      ],
    },
  },
} as const
