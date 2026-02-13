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
      compatibility_scores: {
        Row: {
          created_at: string
          curl_definition_score: number | null
          frizz_control_score: number | null
          goal_alignment_score: number | null
          hair_profile_id: string
          id: string
          ingredient_safety_score: number | null
          moisture_score: number | null
          overall_score: number | null
          performance_score: number | null
          product_id: string
          scalp_care_score: number | null
          score_breakdown: Json | null
          score_explanation: string | null
          strength_repair_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          curl_definition_score?: number | null
          frizz_control_score?: number | null
          goal_alignment_score?: number | null
          hair_profile_id: string
          id?: string
          ingredient_safety_score?: number | null
          moisture_score?: number | null
          overall_score?: number | null
          performance_score?: number | null
          product_id: string
          scalp_care_score?: number | null
          score_breakdown?: Json | null
          score_explanation?: string | null
          strength_repair_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          curl_definition_score?: number | null
          frizz_control_score?: number | null
          goal_alignment_score?: number | null
          hair_profile_id?: string
          id?: string
          ingredient_safety_score?: number | null
          moisture_score?: number | null
          overall_score?: number | null
          performance_score?: number | null
          product_id?: string
          scalp_care_score?: number | null
          score_breakdown?: Json | null
          score_explanation?: string | null
          strength_repair_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compatibility_scores_hair_profile_id_fkey"
            columns: ["hair_profile_id"]
            isOneToOne: false
            referencedRelation: "hair_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compatibility_scores_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
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
          hair_type: string | null
          hair_type_system: string | null
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
          hair_type?: string | null
          hair_type_system?: string | null
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
          hair_type?: string | null
          hair_type_system?: string | null
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
      ingredient_rules: {
        Row: {
          breakage_impact: number
          buildup_risk: number
          category: string | null
          color_treated_impact: number
          confidence: number
          created_at: string
          curl_definition_score: number
          dandruff_impact: number
          density_medium_score: number
          density_thick_score: number
          density_thin_score: number
          dry_climate_modifier: number
          drying_risk: number
          frizz_control_score: number
          heat_damage_impact: number
          humid_climate_modifier: number
          id: string
          ingredient_name: string
          irritation_risk: number
          is_verified: boolean
          moisture_score: number
          normalized_name: string
          notes: string | null
          porosity_high_score: number
          porosity_low_score: number
          porosity_medium_score: number
          protein_score: number
          scalp_health_score: number
          source: string
          thinning_impact: number
          updated_at: string
          verified_by: string | null
        }
        Insert: {
          breakage_impact?: number
          buildup_risk?: number
          category?: string | null
          color_treated_impact?: number
          confidence?: number
          created_at?: string
          curl_definition_score?: number
          dandruff_impact?: number
          density_medium_score?: number
          density_thick_score?: number
          density_thin_score?: number
          dry_climate_modifier?: number
          drying_risk?: number
          frizz_control_score?: number
          heat_damage_impact?: number
          humid_climate_modifier?: number
          id?: string
          ingredient_name: string
          irritation_risk?: number
          is_verified?: boolean
          moisture_score?: number
          normalized_name: string
          notes?: string | null
          porosity_high_score?: number
          porosity_low_score?: number
          porosity_medium_score?: number
          protein_score?: number
          scalp_health_score?: number
          source?: string
          thinning_impact?: number
          updated_at?: string
          verified_by?: string | null
        }
        Update: {
          breakage_impact?: number
          buildup_risk?: number
          category?: string | null
          color_treated_impact?: number
          confidence?: number
          created_at?: string
          curl_definition_score?: number
          dandruff_impact?: number
          density_medium_score?: number
          density_thick_score?: number
          density_thin_score?: number
          dry_climate_modifier?: number
          drying_risk?: number
          frizz_control_score?: number
          heat_damage_impact?: number
          humid_climate_modifier?: number
          id?: string
          ingredient_name?: string
          irritation_risk?: number
          is_verified?: boolean
          moisture_score?: number
          normalized_name?: string
          notes?: string | null
          porosity_high_score?: number
          porosity_low_score?: number
          porosity_medium_score?: number
          protein_score?: number
          scalp_health_score?: number
          source?: string
          thinning_impact?: number
          updated_at?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      product_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          pathway_id: string | null
          product_id: string
          retailer: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          pathway_id?: string | null
          product_id: string
          retailer?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          pathway_id?: string | null
          product_id?: string
          retailer?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_events_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "purchase_pathways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_feedback: {
        Row: {
          created_at: string
          effectiveness_rating: number | null
          id: string
          metadata: Json | null
          outcome_tags: Json | null
          product_id: string
          rating: number | null
          review_text: string | null
          updated_at: string
          user_id: string
          would_repurchase: boolean | null
        }
        Insert: {
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          metadata?: Json | null
          outcome_tags?: Json | null
          product_id: string
          rating?: number | null
          review_text?: string | null
          updated_at?: string
          user_id: string
          would_repurchase?: boolean | null
        }
        Update: {
          created_at?: string
          effectiveness_rating?: number | null
          id?: string
          metadata?: Json | null
          outcome_tags?: Json | null
          product_id?: string
          rating?: number | null
          review_text?: string | null
          updated_at?: string
          user_id?: string
          would_repurchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_feedback_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ingredients: {
        Row: {
          admin_notes: string | null
          compatibility_tags: Json | null
          created_at: string
          formulation_characteristics: Json | null
          id: string
          is_verified: boolean
          moisture_protein_balance: string | null
          parsed_ingredients: Json | null
          performance_tags: Json | null
          product_id: string
          raw_ingredients_text: string | null
          safety_flags: Json | null
          scalp_friendliness: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          weight_richness: string | null
        }
        Insert: {
          admin_notes?: string | null
          compatibility_tags?: Json | null
          created_at?: string
          formulation_characteristics?: Json | null
          id?: string
          is_verified?: boolean
          moisture_protein_balance?: string | null
          parsed_ingredients?: Json | null
          performance_tags?: Json | null
          product_id: string
          raw_ingredients_text?: string | null
          safety_flags?: Json | null
          scalp_friendliness?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          weight_richness?: string | null
        }
        Update: {
          admin_notes?: string | null
          compatibility_tags?: Json | null
          created_at?: string
          formulation_characteristics?: Json | null
          id?: string
          is_verified?: boolean
          moisture_protein_balance?: string | null
          parsed_ingredients?: Json | null
          performance_tags?: Json | null
          product_id?: string
          raw_ingredients_text?: string | null
          safety_flags?: Json | null
          scalp_friendliness?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          weight_richness?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          auto_update_enabled: boolean
          brand: string | null
          canonical_id: string | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_urls: string[] | null
          is_first_party: boolean
          is_internal: boolean
          is_manual_entry: boolean
          is_preferred: boolean
          manual_override_active: boolean
          metadata: Json | null
          name: string
          product_type: string | null
          status: string
          subcategory: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          auto_update_enabled?: boolean
          brand?: string | null
          canonical_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_urls?: string[] | null
          is_first_party?: boolean
          is_internal?: boolean
          is_manual_entry?: boolean
          is_preferred?: boolean
          manual_override_active?: boolean
          metadata?: Json | null
          name: string
          product_type?: string | null
          status?: string
          subcategory?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          auto_update_enabled?: boolean
          brand?: string | null
          canonical_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_urls?: string[] | null
          is_first_party?: boolean
          is_internal?: boolean
          is_manual_entry?: boolean
          is_preferred?: boolean
          manual_override_active?: boolean
          metadata?: Json | null
          name?: string
          product_type?: string | null
          status?: string
          subcategory?: string | null
          updated_at?: string
          updated_by?: string | null
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
      purchase_pathways: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_primary: boolean
          label: string | null
          metadata: Json | null
          pathway_type: string
          product_id: string
          retailer: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          label?: string | null
          metadata?: Json | null
          pathway_type: string
          product_id: string
          retailer?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          label?: string | null
          metadata?: Json | null
          pathway_type?: string
          product_id?: string
          retailer?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_pathways_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      retail_listings: {
        Row: {
          affiliate_url: string | null
          availability: string | null
          created_at: string
          currency: string | null
          id: string
          is_active: boolean
          last_synced_at: string | null
          price: number | null
          product_id: string
          product_url: string | null
          rating: number | null
          raw_data: Json | null
          retailer: string
          retailer_metadata: Json | null
          retailer_product_id: string | null
          review_count: number | null
          updated_at: string
        }
        Insert: {
          affiliate_url?: string | null
          availability?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          price?: number | null
          product_id: string
          product_url?: string | null
          rating?: number | null
          raw_data?: Json | null
          retailer: string
          retailer_metadata?: Json | null
          retailer_product_id?: string | null
          review_count?: number | null
          updated_at?: string
        }
        Update: {
          affiliate_url?: string | null
          availability?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          price?: number | null
          product_id?: string
          product_url?: string | null
          rating?: number | null
          raw_data?: Json | null
          retailer?: string
          retailer_metadata?: Json | null
          retailer_product_id?: string | null
          review_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retail_listings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
