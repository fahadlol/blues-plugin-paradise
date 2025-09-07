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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bundles: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          features: Json
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          plugin_ids: Json
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          plugin_ids?: Json
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          plugin_ids?: Json
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      custom_plugin_requests: {
        Row: {
          assigned_to: string | null
          budget_range: string
          created_at: string
          description: string
          email: string
          estimated_price: number | null
          id: string
          name: string
          notes: string | null
          server_type: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget_range: string
          created_at?: string
          description: string
          email: string
          estimated_price?: number | null
          id?: string
          name: string
          notes?: string | null
          server_type: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget_range?: string
          created_at?: string
          description?: string
          email?: string
          estimated_price?: number | null
          id?: string
          name?: string
          notes?: string | null
          server_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      custom_prebuilts: {
        Row: {
          components: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          components: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          components?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          applies_to: string
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          min_amount: number | null
          name: string
          target_ids: Json | null
          updated_at: string
          used_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applies_to: string
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_amount?: number | null
          name: string
          target_ids?: Json | null
          updated_at?: string
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applies_to?: string
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_amount?: number | null
          name?: string
          target_ids?: Json | null
          updated_at?: string
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          question: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          customer_info: Json
          id: string
          items: Json
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          customer_info: Json
          id?: string
          items: Json
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          customer_info?: Json
          id?: string
          items?: Json
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      plugin_downloads: {
        Row: {
          created_at: string
          customer_id: string
          download_url: string
          downloaded_at: string | null
          expires_at: string
          id: string
          ip_address: string | null
          order_id: string
          plugin_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          download_url: string
          downloaded_at?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          order_id: string
          plugin_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          download_url?: string
          downloaded_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          order_id?: string
          plugin_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_downloads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_downloads_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_reviews: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_verified_purchase: boolean
          order_id: string | null
          plugin_id: string
          rating: number
          review_text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_verified_purchase?: boolean
          order_id?: string | null
          plugin_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_verified_purchase?: boolean
          order_id?: string | null
          plugin_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      plugins: {
        Row: {
          category: string
          changelog: Json | null
          content: string | null
          created_at: string
          created_by: string | null
          description: string
          download_count: number | null
          downloads: number
          features: Json | null
          file_path: string | null
          file_size: number | null
          file_version: number | null
          id: string
          is_active: boolean
          is_featured: boolean
          price: number
          rating: number
          requirements: Json | null
          thumbnail: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          changelog?: Json | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          download_count?: number | null
          downloads?: number
          features?: Json | null
          file_path?: string | null
          file_size?: number | null
          file_version?: number | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          price?: number
          rating?: number
          requirements?: Json | null
          thumbnail?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          changelog?: Json | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          download_count?: number | null
          downloads?: number
          features?: Json | null
          file_path?: string | null
          file_size?: number | null
          file_version?: number | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          price?: number
          rating?: number
          requirements?: Json | null
          thumbnail?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      policies: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          policy_type: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          policy_type: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          policy_type?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          message: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          message: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_download_link: {
        Args: {
          p_customer_id: string
          p_expires_hours?: number
          p_order_id: string
          p_plugin_id: string
        }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer"
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
      app_role: ["admin", "staff", "customer"],
    },
  },
} as const
