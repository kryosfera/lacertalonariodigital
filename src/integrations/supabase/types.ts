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
      admin_province_stats: {
        Args: never
        Returns: {
          professionals: number
          province: string
          total_recipes: number
        }[]
      }
      admin_recipes_per_month: {
        Args: never
        Returns: {
          month: string
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
      cleanup_expired_short_urls: { Args: never; Returns: number }
      generate_recipe_code: { Args: never; Returns: string }
      generate_short_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    },
  },
} as const
