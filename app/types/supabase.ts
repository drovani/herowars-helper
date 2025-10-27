export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
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
          image_hash: string | null
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
          image_hash?: string | null
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
          image_hash?: string | null
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
      hero: {
        Row: {
          attack_type: string[]
          class: string
          faction: string
          main_stat: string
          name: string
          order_rank: number
          slug: string
          stone_source: string[]
          updated_on: string | null
        }
        Insert: {
          attack_type: string[]
          class: string
          faction: string
          main_stat: string
          name: string
          order_rank: number
          slug: string
          stone_source: string[]
          updated_on?: string | null
        }
        Update: {
          attack_type?: string[]
          class?: string
          faction?: string
          main_stat?: string
          name?: string
          order_rank?: number
          slug?: string
          stone_source?: string[]
          updated_on?: string | null
        }
        Relationships: []
      }
      hero_artifact: {
        Row: {
          artifact_type: string
          created_at: string | null
          hero_slug: string
          id: string
          name: string | null
          team_buff: string | null
          team_buff_secondary: string | null
        }
        Insert: {
          artifact_type: string
          created_at?: string | null
          hero_slug: string
          id?: string
          name?: string | null
          team_buff?: string | null
          team_buff_secondary?: string | null
        }
        Update: {
          artifact_type?: string
          created_at?: string | null
          hero_slug?: string
          id?: string
          name?: string | null
          team_buff?: string | null
          team_buff_secondary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hero_artifact_hero_slug_fkey"
            columns: ["hero_slug"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["slug"]
          },
        ]
      }
      hero_equipment_slot: {
        Row: {
          created_at: string | null
          equipment_slug: string | null
          hero_slug: string
          id: string
          quality: string
          slot_position: number
        }
        Insert: {
          created_at?: string | null
          equipment_slug?: string | null
          hero_slug: string
          id?: string
          quality: string
          slot_position: number
        }
        Update: {
          created_at?: string | null
          equipment_slug?: string | null
          hero_slug?: string
          id?: string
          quality?: string
          slot_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "hero_equipment_slot_equipment_slug_fkey"
            columns: ["equipment_slug"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "hero_equipment_slot_hero_slug_fkey"
            columns: ["hero_slug"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["slug"]
          },
        ]
      }
      hero_glyph: {
        Row: {
          created_at: string | null
          hero_slug: string
          id: string
          position: number
          stat_type: string
          stat_value: number
        }
        Insert: {
          created_at?: string | null
          hero_slug: string
          id?: string
          position: number
          stat_type: string
          stat_value: number
        }
        Update: {
          created_at?: string | null
          hero_slug?: string
          id?: string
          position?: number
          stat_type?: string
          stat_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "hero_glyph_hero_slug_fkey"
            columns: ["hero_slug"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["slug"]
          },
        ]
      }
      hero_skin: {
        Row: {
          created_at: string | null
          has_plus: boolean | null
          hero_slug: string
          id: string
          name: string
          source: string | null
          stat_type: string
          stat_value: number
        }
        Insert: {
          created_at?: string | null
          has_plus?: boolean | null
          hero_slug: string
          id?: string
          name: string
          source?: string | null
          stat_type: string
          stat_value: number
        }
        Update: {
          created_at?: string | null
          has_plus?: boolean | null
          hero_slug?: string
          id?: string
          name?: string
          source?: string | null
          stat_type?: string
          stat_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "hero_skin_hero_slug_fkey"
            columns: ["hero_slug"]
            isOneToOne: false
            referencedRelation: "hero"
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
      player_event: {
        Row: {
          created_at: string | null
          created_by: string
          event_data: Json
          event_type: string
          hero_slug: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          event_data?: Json
          event_type: string
          hero_slug: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          event_data?: Json
          event_type?: string
          hero_slug?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_event_hero_slug_fkey"
            columns: ["hero_slug"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["slug"]
          },
        ]
      }
      player_hero: {
        Row: {
          created_at: string | null
          equipment_level: number
          hero_slug: string
          id: string
          level: number
          stars: number
          talisman_level: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          equipment_level?: number
          hero_slug: string
          id?: string
          level?: number
          stars?: number
          talisman_level?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          equipment_level?: number
          hero_slug?: string
          id?: string
          level?: number
          stars?: number
          talisman_level?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_hero_hero_slug_fkey"
            columns: ["hero_slug"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["slug"]
          },
        ]
      }
      player_team: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      player_team_hero: {
        Row: {
          created_at: string | null
          hero_slug: string
          id: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          hero_slug: string
          id?: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          hero_slug?: string
          id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_team_hero_hero_slug_fkey"
            columns: ["hero_slug"]
            isOneToOne: false
            referencedRelation: "hero"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "player_team_hero_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "player_team"
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
          name: string
          quality: string
          slug: string
        }[]
      }
      has_editorial_role: { Args: never; Returns: boolean }
      update_hero_with_relations: {
        Args: {
          p_hero_slug: string
          p_hero_data: Json
          p_artifacts: Json
          p_skins: Json
          p_glyphs: Json
          p_equipment: Json
        }
        Returns: {
          slug: string
          name: string
          class: string
          faction: string
          main_stat: string
          attack_type: string
          artifact_team_buff: string | null
          updated_on: string
        }
      }
      update_policies_with_summary: {
        Args: { operations?: string[]; table_names: string[] }
        Returns: {
          action: string
          count: number
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      equipment_quality: ["gray", "green", "blue", "violet", "orange"],
      equipment_type: ["equipable", "fragment", "recipe"],
    },
  },
} as const

