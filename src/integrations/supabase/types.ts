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
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
        }
        Relationships: []
      }
      credit_audit_log: {
        Row: {
          action: string
          amount: number
          balance_after: number | null
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          amount: number
          balance_after?: number | null
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          amount?: number
          balance_after?: number | null
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          business_name: string
          category: string | null
          city: string | null
          has_website: boolean
          id: string
          osm_updated_at: string | null
          phone: string | null
          rating: number | null
          review_count: number | null
          saved_at: string
          tags: string[]
          user_id: string
        }
        Insert: {
          address?: string | null
          business_name: string
          category?: string | null
          city?: string | null
          has_website?: boolean
          id?: string
          osm_updated_at?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          saved_at?: string
          tags?: string[]
          user_id: string
        }
        Update: {
          address?: string | null
          business_name?: string
          category?: string | null
          city?: string | null
          has_website?: boolean
          id?: string
          osm_updated_at?: string | null
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          saved_at?: string
          tags?: string[]
          user_id?: string
        }
        Relationships: []
      }
      linkedin_copy_events: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          linkedin_url: string
          member_name: string
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          linkedin_url: string
          member_name: string
          status: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          linkedin_url?: string
          member_name?: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      preview_views: {
        Row: {
          id: string
          is_cta_clicked: boolean
          project_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          is_cta_clicked?: boolean
          project_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          is_cta_clicked?: boolean
          project_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "preview_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preview_views_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarded_at: string | null
          plan: string
          referral_source: string | null
          script_credits: number
          search_credits: number
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarded_at?: string | null
          plan?: string
          referral_source?: string | null
          script_credits?: number
          search_credits?: number
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarded_at?: string | null
          plan?: string
          referral_source?: string | null
          script_credits?: number
          search_credits?: number
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          business_name: string
          category: string | null
          city: string | null
          created_at: string
          id: string
          lead_id: string | null
          notes: string | null
          phone: string | null
          preview_token: string
          status: string
          user_id: string
        }
        Insert: {
          business_name: string
          category?: string | null
          city?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          preview_token?: string
          status?: string
          user_id: string
        }
        Update: {
          business_name?: string
          category?: string | null
          city?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          notes?: string | null
          phone?: string | null
          preview_token?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          business_name: string | null
          content: string
          created_at: string
          id: string
          lead_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          content: string
          created_at?: string
          id?: string
          lead_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          content?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scripts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      projects_public: {
        Row: {
          business_name: string | null
          category: string | null
          city: string | null
          id: string | null
          phone: string | null
          preview_token: string | null
        }
        Insert: {
          business_name?: string | null
          category?: string | null
          city?: string | null
          id?: string | null
          phone?: string | null
          preview_token?: string | null
        }
        Update: {
          business_name?: string | null
          category?: string | null
          city?: string | null
          id?: string | null
          phone?: string | null
          preview_token?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      consume_script_credit: { Args: never; Returns: number }
      consume_search_credit: { Args: never; Returns: number }
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
