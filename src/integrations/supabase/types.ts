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
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description_html: string | null
          document_urls: string[] | null
          ean: string | null
          gallery_urls: string[] | null
          id: string
          is_active: boolean | null
          is_visible: boolean | null
          main_image_url: string | null
          name: string
          prescription_count: number | null
          reference: string | null
          seo_description: string | null
          seo_title: string | null
          share_image_url: string | null
          slug: string
          sort_order: number | null
          thumbnail_url: string | null
          updated_at: string
          video_urls: string[] | null
          views_count: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description_html?: string | null
          document_urls?: string[] | null
          ean?: string | null
          gallery_urls?: string[] | null
          id?: string
          is_active?: boolean | null
          is_visible?: boolean | null
          main_image_url?: string | null
          name: string
          prescription_count?: number | null
          reference?: string | null
          seo_description?: string | null
          seo_title?: string | null
          share_image_url?: string | null
          slug: string
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          video_urls?: string[] | null
          views_count?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description_html?: string | null
          document_urls?: string[] | null
          ean?: string | null
          gallery_urls?: string[] | null
          id?: string
          is_active?: boolean | null
          is_visible?: boolean | null
          main_image_url?: string | null
          name?: string
          prescription_count?: number | null
          reference?: string | null
          seo_description?: string | null
          seo_title?: string | null
          share_image_url?: string | null
          slug?: string
          sort_order?: number | null
          thumbnail_url?: string | null
          updated_at?: string
          video_urls?: string[] | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          clinic_address: string | null
          clinic_name: string | null
          created_at: string
          id: string
          locality: string | null
          logo_url: string | null
          professional_name: string | null
          province: string | null
          registration_number: string | null
          signature_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          clinic_address?: string | null
          clinic_name?: string | null
          created_at?: string
          id?: string
          locality?: string | null
          logo_url?: string | null
          professional_name?: string | null
          province?: string | null
          registration_number?: string | null
          signature_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          clinic_address?: string | null
          clinic_name?: string | null
          created_at?: string
          id?: string
          locality?: string | null
          logo_url?: string | null
          professional_name?: string | null
          province?: string | null
          registration_number?: string | null
          signature_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quick_recipes: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          products: Json
          sent_via: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          products?: Json
          sent_via?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          products?: Json
          sent_via?: string | null
        }
        Relationships: []
      }
      recipe_templates: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          products: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          products?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          products?: Json
          user_id?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          created_at: string
          dispensed_at: string | null
          dispensed_by: string | null
          id: string
          notes: string | null
          patient_id: string | null
          patient_name: string
          products: Json
          recipe_code: string | null
          sent_via: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dispensed_at?: string | null
          dispensed_by?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          products?: Json
          recipe_code?: string | null
          sent_via?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dispensed_at?: string | null
          dispensed_by?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          products?: Json
          recipe_code?: string | null
          sent_via?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          created_at: string
          description: string | null
          external_url: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_visible: boolean
          kind: string
          pdf_url: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
          vimeo_hash: string | null
          vimeo_id: string | null
          vimeo_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean
          kind?: string
          pdf_url?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
          vimeo_hash?: string | null
          vimeo_id?: string | null
          vimeo_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean
          kind?: string
          pdf_url?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
          vimeo_hash?: string | null
          vimeo_id?: string | null
          vimeo_url?: string | null
        }
        Relationships: []
      }
      short_urls: {
        Row: {
          code: string
          created_at: string
          data: Json
          expires_at: string | null
          id: string
        }
        Insert: {
          code?: string
          created_at?: string
          data: Json
          expires_at?: string | null
          id?: string
        }
        Update: {
          code?: string
          created_at?: string
          data?: Json
          expires_at?: string | null
          id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_admin_reply: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          category: Database["public"]["Enums"]["ticket_category"]
          created_at: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolved_at: string | null
          screenshot_url: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_deletion_audit: {
        Row: {
          deleted_at: string
          deleted_by: string
          deleted_by_email: string | null
          deleted_user_email: string | null
          deleted_user_id: string
          deleted_user_label: string | null
          id: string
          reason: string | null
        }
        Insert: {
          deleted_at?: string
          deleted_by: string
          deleted_by_email?: string | null
          deleted_user_email?: string | null
          deleted_user_id: string
          deleted_user_label?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          deleted_at?: string
          deleted_by?: string
          deleted_by_email?: string | null
          deleted_user_email?: string | null
          deleted_user_id?: string
          deleted_user_label?: string | null
          id?: string
          reason?: string | null
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
      patients_with_stats: {
        Row: {
          created_at: string | null
          email: string | null
          id: string | null
          last_recipe_date: string | null
          name: string | null
          notes: string | null
          phone: string | null
          recipe_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_active_sessions: {
        Args: never
        Returns: {
          clinic_name: string
          created_at: string
          email: string
          ip: string
          not_after: string
          professional_name: string
          session_id: string
          updated_at: string
          user_agent: string
          user_id: string
        }[]
      }
      admin_activity_heatmap: {
        Args: never
        Returns: {
          hour: number
          total: number
          weekday: number
        }[]
      }
      admin_activity_heatmap_range: {
        Args: { end_ts: string; start_ts: string }
        Returns: {
          hour: number
          total: number
          weekday: number
        }[]
      }
      admin_kpis_range: {
        Args: { end_ts: string; start_ts: string }
        Returns: {
          avg_products_per_recipe: number
          dispensed_count: number
          period_count: number
          previous_period_count: number
          today_count: number
          total_recipes: number
        }[]
      }
      admin_login_audit: {
        Args: { days?: number; lim?: number }
        Returns: {
          action: string
          email: string
          id: string
          ip_address: string
          occurred_at: string
          user_agent: string
          user_id: string
        }[]
      }
      admin_province_stats: {
        Args: never
        Returns: {
          professionals: number
          province: string
          total_recipes: number
        }[]
      }
      admin_province_stats_range: {
        Args: { end_ts: string; start_ts: string }
        Returns: {
          professionals: number
          province: string
          total_recipes: number
        }[]
      }
      admin_recipes_comparison: {
        Args: never
        Returns: {
          avg_products_per_recipe: number
          current_month: number
          previous_month: number
          today_count: number
        }[]
      }
      admin_recipes_per_day: {
        Args: { days?: number }
        Returns: {
          day: string
          total: number
        }[]
      }
      admin_recipes_per_month: {
        Args: never
        Returns: {
          month: string
          total: number
        }[]
      }
      admin_recipes_timeseries: {
        Args: { bucket?: string; end_ts: string; start_ts: string }
        Returns: {
          period: string
          total: number
        }[]
      }
      admin_send_methods_range: {
        Args: { end_ts: string; start_ts: string }
        Returns: {
          method: string
          total: number
        }[]
      }
      admin_top_products: {
        Args: { lim?: number }
        Returns: {
          product_name: string
          reference: string
          thumbnail_url: string
          times_prescribed: number
        }[]
      }
      admin_top_products_range: {
        Args: { end_ts: string; lim?: number; start_ts: string }
        Returns: {
          product_name: string
          reference: string
          thumbnail_url: string
          times_prescribed: number
        }[]
      }
      admin_top_professionals: {
        Args: { lim?: number }
        Returns: {
          clinic_name: string
          locality: string
          professional_name: string
          province: string
          total_recipes: number
          user_id: string
        }[]
      }
      admin_top_professionals_range: {
        Args: { end_ts: string; lim?: number; start_ts: string }
        Returns: {
          clinic_name: string
          locality: string
          professional_name: string
          province: string
          total_recipes: number
          user_id: string
        }[]
      }
      admin_user_activity_heatmap: {
        Args: { target_user: string }
        Returns: {
          hour: number
          total: number
          weekday: number
        }[]
      }
      admin_user_overview: {
        Args: { target_user: string }
        Returns: {
          avg_products_per_recipe: number
          current_month: number
          dispensation_rate: number
          dispensed_count: number
          first_recipe_at: string
          last_recipe_at: string
          previous_month: number
          today_count: number
          total_patients: number
          total_recipes: number
        }[]
      }
      admin_user_patients_with_stats: {
        Args: { target_user: string }
        Returns: {
          created_at: string
          email: string
          id: string
          last_recipe_at: string
          name: string
          notes: string
          phone: string
          total_recipes: number
        }[]
      }
      admin_user_recipes_timeseries: {
        Args: { days?: number; target_user: string }
        Returns: {
          day: string
          total: number
        }[]
      }
      admin_user_send_methods: {
        Args: { target_user: string }
        Returns: {
          method: string
          total: number
        }[]
      }
      admin_user_top_products: {
        Args: { lim?: number; target_user: string }
        Returns: {
          product_name: string
          reference: string
          thumbnail_url: string
          times_prescribed: number
        }[]
      }
      cleanup_expired_short_urls: { Args: never; Returns: number }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      generate_recipe_code: { Args: never; Returns: string }
      generate_short_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      ticket_category: "bug" | "feature" | "question" | "other"
      ticket_priority: "low" | "medium" | "high"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
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
      ticket_category: ["bug", "feature", "question", "other"],
      ticket_priority: ["low", "medium", "high"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
    },
  },
} as const
