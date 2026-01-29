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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      hair_profiles: {
        Row: {
          allergies: string[] | null
          budget_preference: string | null
          climate: string
          created_at: string
          current_routine_frequency: string | null
          exercise_frequency: string
          hair_concerns: string[] | null
          hair_density: string
          hair_length: string
          hair_porosity: string
          hair_texture: string
          hair_type: string
          health_conditions: string[] | null
          heat_styling_frequency: string
          hormonal_status: string | null
          id: string
          medications: string | null
          product_preferences: string[] | null
          scalp_concerns: string[] | null
          scalp_condition: string
          sun_exposure: string
          updated_at: string
          user_id: string
          water_type: string
        }
        Insert: {
          allergies?: string[] | null
          budget_preference?: string | null
          climate: string
          created_at?: string
          current_routine_frequency?: string | null
          exercise_frequency: string
          hair_concerns?: string[] | null
          hair_density: string
          hair_length: string
          hair_porosity: string
          hair_texture: string
          hair_type: string
          health_conditions?: string[] | null
          heat_styling_frequency: string
          hormonal_status?: string | null
          id?: string
          medications?: string | null
          product_preferences?: string[] | null
          scalp_concerns?: string[] | null
          scalp_condition: string
          sun_exposure: string
          updated_at?: string
          user_id: string
          water_type: string
        }
        Update: {
          allergies?: string[] | null
          budget_preference?: string | null
          climate?: string
          created_at?: string
          current_routine_frequency?: string | null
          exercise_frequency?: string
          hair_concerns?: string[] | null
          hair_density?: string
          hair_length?: string
          hair_porosity?: string
          hair_texture?: string
          hair_type?: string
          health_conditions?: string[] | null
          heat_styling_frequency?: string
          hormonal_status?: string | null
          id?: string
          medications?: string | null
          product_preferences?: string[] | null
          scalp_concerns?: string[] | null
          scalp_condition?: string
          sun_exposure?: string
          updated_at?: string
          user_id?: string
          water_type?: string
        }
        Relationships: []
      }
      ingredient_checks: {
        Row: {
          analysis_result: Json
          created_at: string
          flagged_ingredients: Json | null
          id: string
          ingredients_input: string
          product_name: string | null
          safe_ingredients: Json | null
          user_id: string
        }
        Insert: {
          analysis_result: Json
          created_at?: string
          flagged_ingredients?: Json | null
          id?: string
          ingredients_input: string
          product_name?: string | null
          safe_ingredients?: Json | null
          user_id: string
        }
        Update: {
          analysis_result?: Json
          created_at?: string
          flagged_ingredients?: Json | null
          id?: string
          ingredients_input?: string
          product_name?: string | null
          safe_ingredients?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      routines: {
        Row: {
          ai_generated: boolean
          created_at: string
          donts: string[] | null
          dos: string[] | null
          educational_tips: string[] | null
          hair_profile_id: string | null
          id: string
          ingredient_guidance: Json | null
          is_active: boolean
          monthly_routine: Json
          routine_name: string
          updated_at: string
          user_id: string
          wash_day_routine: Json
          weekly_routine: Json
        }
        Insert: {
          ai_generated?: boolean
          created_at?: string
          donts?: string[] | null
          dos?: string[] | null
          educational_tips?: string[] | null
          hair_profile_id?: string | null
          id?: string
          ingredient_guidance?: Json | null
          is_active?: boolean
          monthly_routine?: Json
          routine_name?: string
          updated_at?: string
          user_id: string
          wash_day_routine?: Json
          weekly_routine?: Json
        }
        Update: {
          ai_generated?: boolean
          created_at?: string
          donts?: string[] | null
          dos?: string[] | null
          educational_tips?: string[] | null
          hair_profile_id?: string | null
          id?: string
          ingredient_guidance?: Json | null
          is_active?: boolean
          monthly_routine?: Json
          routine_name?: string
          updated_at?: string
          user_id?: string
          wash_day_routine?: Json
          weekly_routine?: Json
        }
        Relationships: [
          {
            foreignKeyName: "routines_hair_profile_id_fkey"
            columns: ["hair_profile_id"]
            isOneToOne: false
            referencedRelation: "hair_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
