export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      payments: {
        Row: {
          approved_at: string
          created_at: string
          metadata: Json
          order_id: string
          order_name: string
          payment_id: number
          payment_key: string
          raw_data: Json
          receipt_url: string
          requested_at: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at: string
          created_at?: string
          metadata: Json
          order_id: string
          order_name: string
          payment_id?: never
          payment_key: string
          raw_data: Json
          receipt_url: string
          requested_at: string
          status: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string
          created_at?: string
          metadata?: Json
          order_id?: string
          order_name?: string
          payment_id?: never
          payment_key?: string
          raw_data?: Json
          receipt_url?: string
          requested_at?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      place_likes: {
        Row: {
          place_id: number
          profile_id: string
        }
        Insert: {
          place_id: number
          profile_id: string
        }
        Update: {
          place_id?: number
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_likes_place_id_places_id_fk"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_likes_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      place_to_tags: {
        Row: {
          place_id: number
          tag_id: number
        }
        Insert: {
          place_id: number
          tag_id: number
        }
        Update: {
          place_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "place_to_tags_place_id_places_id_fk"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_to_tags_tag_id_tags_id_fk"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "place_to_tags_tag_id_tags_id_fk"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags_list_view"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          homepage: string | null
          id: number
          image_url: string | null
          instagram: string | null
          lat: number | null
          lng: number | null
          name: string
          naver: string | null
          phone: string | null
          roadAddress: string | null
          source: Database["public"]["Enums"]["place_sources"]
          stats: Json
          status: Database["public"]["Enums"]["place_status"]
          submitted_by: string | null
          type: Database["public"]["Enums"]["place_types"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          homepage?: string | null
          id?: never
          image_url?: string | null
          instagram?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          naver?: string | null
          phone?: string | null
          roadAddress?: string | null
          source?: Database["public"]["Enums"]["place_sources"]
          stats?: Json
          status?: Database["public"]["Enums"]["place_status"]
          submitted_by?: string | null
          type: Database["public"]["Enums"]["place_types"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          homepage?: string | null
          id?: never
          image_url?: string | null
          instagram?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          naver?: string | null
          phone?: string | null
          roadAddress?: string | null
          source?: Database["public"]["Enums"]["place_sources"]
          stats?: Json
          status?: Database["public"]["Enums"]["place_status"]
          submitted_by?: string | null
          type?: Database["public"]["Enums"]["place_types"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "places_submitted_by_profiles_profile_id_fk"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          marketing_consent: boolean
          name: string
          profile_id: string
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          marketing_consent?: boolean
          name: string
          profile_id: string
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          marketing_consent?: boolean
          name?: string
          profile_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          place_id: number
          profile_id: string | null
          rating: number
          review_id: number
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          place_id: number
          profile_id?: string | null
          rating: number
          review_id?: never
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          place_id?: number
          profile_id?: string | null
          rating?: number
          review_id?: never
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_place_id_places_id_fk"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_profile_id_profiles_profile_id_fk"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      tags: {
        Row: {
          category: Database["public"]["Enums"]["tag_category"] | null
          created_at: string
          description: string | null
          displayOrder: number
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["tag_category"] | null
          created_at?: string
          description?: string | null
          displayOrder?: number
          id?: never
          name: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["tag_category"] | null
          created_at?: string
          description?: string | null
          displayOrder?: number
          id?: never
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      tags_list_view: {
        Row: {
          category: Database["public"]["Enums"]["tag_category"] | null
          description: string | null
          id: number | null
          name: string | null
          place_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      place_sources: "user" | "admin"
      place_status: "pending" | "approved" | "rejected"
      place_type: "restaurant" | "walk"
      place_types: "restaurant" | "trail"
      price_level: "cheap" | "moderate" | "expensive"
      submission_status: "pending" | "approved" | "rejected"
      submission_type: "new" | "update" | "removal"
      tag_category:
        | "facility"
        | "atmosphere"
        | "price"
        | "meal_category"
        | "meal_type"
        | "meal_time"
        | "etc"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      place_sources: ["user", "admin"],
      place_status: ["pending", "approved", "rejected"],
      place_type: ["restaurant", "walk"],
      place_types: ["restaurant", "trail"],
      price_level: ["cheap", "moderate", "expensive"],
      submission_status: ["pending", "approved", "rejected"],
      submission_type: ["new", "update", "removal"],
      tag_category: [
        "facility",
        "atmosphere",
        "price",
        "meal_category",
        "meal_type",
        "meal_time",
        "etc",
      ],
    },
  },
} as const
