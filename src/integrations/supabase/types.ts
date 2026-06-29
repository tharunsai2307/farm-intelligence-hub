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
      farms: {
        Row: {
          area_hectares: number | null
          created_at: string
          deleted_at: string | null
          expected_harvest: string | null
          id: string
          irrigation_type: string | null
          name: string
          owner_id: string
          planting_date: string | null
          soil_type: string | null
          updated_at: string
          water_source: string | null
        }
        Insert: {
          area_hectares?: number | null
          created_at?: string
          deleted_at?: string | null
          expected_harvest?: string | null
          id?: string
          irrigation_type?: string | null
          name: string
          owner_id: string
          planting_date?: string | null
          soil_type?: string | null
          updated_at?: string
          water_source?: string | null
        }
        Update: {
          area_hectares?: number | null
          created_at?: string
          deleted_at?: string | null
          expected_harvest?: string | null
          id?: string
          irrigation_type?: string | null
          name?: string
          owner_id?: string
          planting_date?: string | null
          soil_type?: string | null
          updated_at?: string
          water_source?: string | null
        }
        Relationships: []
      }
      irrigation_records: {
        Row: {
          created_at: string
          ended_at: string | null
          farm_id: string
          id: string
          method: string | null
          started_at: string
          volume_liters: number | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          farm_id: string
          id?: string
          method?: string | null
          started_at?: string
          volume_liters?: number | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          farm_id?: string
          id?: string
          method?: string | null
          started_at?: string
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
          email: string | null
          full_name: string | null
          id: string
          language: string
          location: string | null
          onboarded: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          language?: string
          location?: string | null
          onboarded?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string
          location?: string | null
          onboarded?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      soil_records: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          moisture: number | null
          nitrogen: number | null
          organic_matter: number | null
          ph: number | null
          phosphorus: number | null
          potassium: number | null
          recorded_at: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          moisture?: number | null
          nitrogen?: number | null
          organic_matter?: number | null
          ph?: number | null
          phosphorus?: number | null
          potassium?: number | null
          recorded_at?: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          moisture?: number | null
          nitrogen?: number | null
          organic_matter?: number | null
          ph?: number | null
          phosphorus?: number | null
          potassium?: number | null
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "soil_records_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
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
      weather_records: {
        Row: {
          created_at: string
          farm_id: string
          humidity: number | null
          id: string
          rainfall_mm: number | null
          recorded_at: string
          source: string | null
          temp_c: number | null
          wind_kph: number | null
        }
        Insert: {
          created_at?: string
          farm_id: string
          humidity?: number | null
          id?: string
          rainfall_mm?: number | null
          recorded_at?: string
          source?: string | null
          temp_c?: number | null
          wind_kph?: number | null
        }
        Update: {
          created_at?: string
          farm_id?: string
          humidity?: number | null
          id?: string
          rainfall_mm?: number | null
          recorded_at?: string
          source?: string | null
          temp_c?: number | null
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
    },
  },
} as const
