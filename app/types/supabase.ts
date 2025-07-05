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
      chapter: {
        Row: {
          id: number
          title: string
        }
        Insert: {
          id: number
          title: string
        }
        Update: {
          id?: number
          title?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          buy_value_coin: number | null
          buy_value_gold: number | null
          campaign_sources: string[] | null
          crafting_gold_cost: number | null
          guild_activity_points: number
          hero_level_required: number | null
          name: string
          quality: Database["public"]["Enums"]["equipment_quality"]
          sell_value: number
          slug: string
          type: Database["public"]["Enums"]["equipment_type"]
        }
        Insert: {
          buy_value_coin?: number | null
          buy_value_gold?: number | null
          campaign_sources?: string[] | null
          crafting_gold_cost?: number | null
          guild_activity_points: number
          hero_level_required?: number | null
          name: string
          quality: Database["public"]["Enums"]["equipment_quality"]
          sell_value: number
          slug: string
          type: Database["public"]["Enums"]["equipment_type"]
        }
        Update: {
          buy_value_coin?: number | null
          buy_value_gold?: number | null
          campaign_sources?: string[] | null
          crafting_gold_cost?: number | null
          guild_activity_points?: number
          hero_level_required?: number | null
          name?: string
          quality?: Database["public"]["Enums"]["equipment_quality"]
          sell_value?: number
          slug?: string
          type?: Database["public"]["Enums"]["equipment_type"]
        }
        Relationships: []
      }
      equipment_required_item: {
        Row: {
          base_slug: string
          quantity: number
          required_slug: string
        }
        Insert: {
          base_slug: string
          quantity: number
          required_slug: string
        }
        Update: {
          base_slug?: string
          quantity?: number
          required_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_required_item_base_slug_fkey"
            columns: ["base_slug"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "equipment_required_item_required_slug_fkey"
            columns: ["required_slug"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["slug"]
          },
        ]
      }
      equipment_stat: {
        Row: {
          equipment_slug: string
          stat: string
          value: number
        }
        Insert: {
          equipment_slug: string
          stat: string
          value: number
        }
        Update: {
          equipment_slug?: string
          stat?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "equipment_stat_equipment_slug_fkey"
            columns: ["equipment_slug"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["slug"]
          },
        ]
      }
      mission: {
        Row: {
          chapter_id: number
          energy_cost: number | null
          hero_slug: string | null
          level: number | null
          name: string
          slug: string
        }
        Insert: {
          chapter_id: number
          energy_cost?: number | null
          hero_slug?: string | null
          level?: number | null
          name: string
          slug: string
        }
        Update: {
          chapter_id?: number
          energy_cost?: number | null
          hero_slug?: string | null
          level?: number | null
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapter"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_equipment_with_neighbors: {
        Args: { slug_input: string }
        Returns: {
          quality: string
          slug: string
          name: string
        }[]
      }
    }
    Enums: {
      equipment_quality: "gray" | "green" | "blue" | "violet" | "orange"
      equipment_type: "equipable" | "fragment" | "recipe"
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
      equipment_quality: ["gray", "green", "blue", "violet", "orange", "red"],
      equipment_type: ["equipable", "fragment", "recipe"],
    },
  },
} as const
