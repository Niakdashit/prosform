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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blocked_participations: {
        Row: {
          block_reason: string
          blocked_at: string
          campaign_id: string
          device_fingerprint: string | null
          email: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
        }
        Insert: {
          block_reason: string
          blocked_at?: string
          campaign_id: string
          device_fingerprint?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
        }
        Update: {
          block_reason?: string
          blocked_at?: string
          campaign_id?: string
          device_fingerprint?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_participations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_analytics: {
        Row: {
          avg_time_spent: number | null
          campaign_id: string
          created_at: string
          id: string
          last_participation_at: string | null
          total_completions: number | null
          total_participations: number | null
          total_views: number | null
          updated_at: string
        }
        Insert: {
          avg_time_spent?: number | null
          campaign_id: string
          created_at?: string
          id?: string
          last_participation_at?: string | null
          total_completions?: number | null
          total_participations?: number | null
          total_views?: number | null
          updated_at?: string
        }
        Update: {
          avg_time_spent?: number | null
          campaign_id?: string
          created_at?: string
          id?: string
          last_participation_at?: string | null
          total_completions?: number | null
          total_participations?: number | null
          total_views?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_participants: {
        Row: {
          browser: string | null
          campaign_id: string
          city: string | null
          completed_at: string | null
          country: string | null
          created_at: string
          device_fingerprint: string | null
          device_type: string | null
          email: string | null
          id: string
          ip_address: string | null
          os: string | null
          participation_data: Json | null
          prize_claimed: boolean | null
          prize_claimed_at: string | null
          prize_won: Json | null
          referrer: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          campaign_id: string
          city?: string | null
          completed_at?: string | null
          country?: string | null
          created_at?: string
          device_fingerprint?: string | null
          device_type?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          os?: string | null
          participation_data?: Json | null
          prize_claimed?: boolean | null
          prize_claimed_at?: string | null
          prize_won?: Json | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          campaign_id?: string
          city?: string | null
          completed_at?: string | null
          country?: string | null
          created_at?: string
          device_fingerprint?: string | null
          device_type?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          os?: string | null
          participation_data?: Json | null
          prize_claimed?: boolean | null
          prize_claimed_at?: string | null
          prize_won?: Json | null
          referrer?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_settings: {
        Row: {
          auto_block_enabled: boolean
          block_duration_hours: number
          campaign_id: string | null
          created_at: string
          device_max_attempts: number
          device_window_minutes: number
          email_max_attempts: number
          email_window_minutes: number
          id: string
          ip_max_attempts: number
          ip_window_minutes: number
          updated_at: string
        }
        Insert: {
          auto_block_enabled?: boolean
          block_duration_hours?: number
          campaign_id?: string | null
          created_at?: string
          device_max_attempts?: number
          device_window_minutes?: number
          email_max_attempts?: number
          email_window_minutes?: number
          id?: string
          ip_max_attempts?: number
          ip_window_minutes?: number
          updated_at?: string
        }
        Update: {
          auto_block_enabled?: boolean
          block_duration_hours?: number
          campaign_id?: string | null
          created_at?: string
          device_max_attempts?: number
          device_window_minutes?: number
          email_max_attempts?: number
          email_window_minutes?: number
          id?: string
          ip_max_attempts?: number
          ip_window_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          app_title: string
          config: Json
          created_at: string
          ends_at: string | null
          id: string
          is_published: boolean
          last_edited_at: string
          participation_count: number | null
          participation_limit: number | null
          public_url_slug: string | null
          published_at: string | null
          published_url: string | null
          starts_at: string | null
          status: string
          thumbnail_url: string | null
          title: string | null
          type: Database["public"]["Enums"]["campaign_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          app_title: string
          config?: Json
          created_at?: string
          ends_at?: string | null
          id?: string
          is_published?: boolean
          last_edited_at?: string
          participation_count?: number | null
          participation_limit?: number | null
          public_url_slug?: string | null
          published_at?: string | null
          published_url?: string | null
          starts_at?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string | null
          type: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          app_title?: string
          config?: Json
          created_at?: string
          ends_at?: string | null
          id?: string
          is_published?: boolean
          last_edited_at?: string
          participation_count?: number | null
          participation_limit?: number | null
          public_url_slug?: string | null
          published_at?: string | null
          published_url?: string | null
          starts_at?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["campaign_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gdpr_exports: {
        Row: {
          completed_at: string | null
          export_type: string
          file_url: string | null
          id: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          export_type: string
          file_url?: string | null
          id?: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          export_type?: string
          file_url?: string | null
          id?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      instant_win_prizes: {
        Row: {
          active_from: string | null
          active_until: string | null
          campaign_id: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean
          prize_description: string | null
          prize_image_url: string | null
          prize_name: string
          prize_value: number | null
          remaining_quantity: number
          total_quantity: number
          updated_at: string
          win_probability: number | null
        }
        Insert: {
          active_from?: string | null
          active_until?: string | null
          campaign_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          prize_description?: string | null
          prize_image_url?: string | null
          prize_name: string
          prize_value?: number | null
          remaining_quantity?: number
          total_quantity?: number
          updated_at?: string
          win_probability?: number | null
        }
        Update: {
          active_from?: string | null
          active_until?: string | null
          campaign_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          prize_description?: string | null
          prize_image_url?: string | null
          prize_name?: string
          prize_value?: number | null
          remaining_quantity?: number
          total_quantity?: number
          updated_at?: string
          win_probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "instant_win_prizes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      prize_draws: {
        Row: {
          campaign_id: string
          created_at: string
          created_by: string | null
          draw_date: string
          draw_name: string
          id: string
          notes: string | null
          selection_criteria: Json | null
          total_participants: number
          winners: Json
          winners_count: number
        }
        Insert: {
          campaign_id: string
          created_at?: string
          created_by?: string | null
          draw_date?: string
          draw_name: string
          id?: string
          notes?: string | null
          selection_criteria?: Json | null
          total_participants?: number
          winners?: Json
          winners_count: number
        }
        Update: {
          campaign_id?: string
          created_at?: string
          created_by?: string | null
          draw_date?: string
          draw_name?: string
          id?: string
          notes?: string | null
          selection_criteria?: Json | null
          total_participants?: number
          winners?: Json
          winners_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "prize_draws_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
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
      saved_forms: {
        Row: {
          created_at: string
          fields: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fields?: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fields?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          analytics_cookies: boolean | null
          consent_given_at: string
          functional_cookies: boolean | null
          id: string
          ip_address: string | null
          marketing_cookies: boolean | null
          participant_email: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          analytics_cookies?: boolean | null
          consent_given_at?: string
          functional_cookies?: boolean | null
          id?: string
          ip_address?: string | null
          marketing_cookies?: boolean | null
          participant_email?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          analytics_cookies?: boolean | null
          consent_given_at?: string
          functional_cookies?: boolean | null
          id?: string
          ip_address?: string | null
          marketing_cookies?: boolean | null
          participant_email?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      realtime_stats: {
        Row: {
          active_campaigns: number | null
          last_24h: number | null
          last_hour: number | null
          total_participations: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _get_effective_campaign_settings: {
        Args: { p_campaign_id: string }
        Returns: {
          auto_block_enabled: boolean
          block_duration_hours: number
          campaign_id: string | null
          created_at: string
          device_max_attempts: number
          device_window_minutes: number
          email_max_attempts: number
          email_window_minutes: number
          id: string
          ip_max_attempts: number
          ip_window_minutes: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "campaign_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      check_rate_limit: {
        Args: {
          p_campaign_id: string
          p_identifier: string
          p_identifier_type: string
          p_max_attempts: number
          p_window_minutes: number
        }
        Returns: Json
      }
      generate_campaign_slug: {
        Args: { campaign_id: string; campaign_title: string }
        Returns: string
      }
      get_campaign_prize_stats: {
        Args: { p_campaign_id: string }
        Returns: Json
      }
      get_campaign_settings: {
        Args: { p_campaign_id: string }
        Returns: {
          auto_block_enabled: boolean
          block_duration_hours: number
          campaign_id: string | null
          created_at: string
          device_max_attempts: number
          device_window_minutes: number
          email_max_attempts: number
          email_window_minutes: number
          id: string
          ip_max_attempts: number
          ip_window_minutes: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "campaign_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_campaign_stats: { Args: { p_campaign_id: string }; Returns: Json }
      get_conversion_funnel: { Args: { p_campaign_id: string }; Returns: Json }
      get_participations_by_day: {
        Args: { p_campaign_id: string; p_days?: number }
        Returns: {
          completions: number
          date: string
          participations: number
          unique_emails: number
        }[]
      }
      get_prize_timeline: {
        Args: { p_campaign_id: string; p_days?: number }
        Returns: {
          date: string
          total_prize_value: number
          winners_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_participant_blocked: {
        Args: {
          p_campaign_id: string
          p_device_fingerprint?: string
          p_email?: string
          p_ip_address?: string
        }
        Returns: boolean
      }
      upsert_campaign_settings: {
        Args: {
          p_auto_block_enabled?: boolean
          p_block_duration_hours?: number
          p_campaign_id: string
          p_device_max_attempts?: number
          p_device_window_minutes?: number
          p_email_max_attempts?: number
          p_email_window_minutes?: number
          p_ip_max_attempts?: number
          p_ip_window_minutes?: number
        }
        Returns: {
          auto_block_enabled: boolean
          block_duration_hours: number
          campaign_id: string | null
          created_at: string
          device_max_attempts: number
          device_window_minutes: number
          email_max_attempts: number
          email_window_minutes: number
          id: string
          ip_max_attempts: number
          ip_window_minutes: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "campaign_settings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "user"
      campaign_type: "form" | "wheel" | "quiz" | "jackpot" | "scratch"
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
      app_role: ["admin", "user"],
      campaign_type: ["form", "wheel", "quiz", "jackpot", "scratch"],
    },
  },
} as const
