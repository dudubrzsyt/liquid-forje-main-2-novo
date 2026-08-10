export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          detail: Json;
          id: string;
          target: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          detail?: Json;
          id?: string;
          target?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          detail?: Json;
          id?: string;
          target?: string | null;
        };
        Relationships: [];
      };
      community_posts: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          media_type: string | null;
          media_url: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          media_type?: string | null;
          media_url?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          media_type?: string | null;
          media_url?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      dev_ai_analysis: {
        Row: {
          created_at: string;
          dev_profile_id: string;
          github_data: Json;
          id: string;
          score: number;
          summary: string | null;
          tier: Database["public"]["Enums"]["diamond_tier"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          dev_profile_id: string;
          github_data?: Json;
          id?: string;
          score?: number;
          summary?: string | null;
          tier?: Database["public"]["Enums"]["diamond_tier"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          dev_profile_id?: string;
          github_data?: Json;
          id?: string;
          score?: number;
          summary?: string | null;
          tier?: Database["public"]["Enums"]["diamond_tier"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dev_ai_analysis_dev_profile_id_fkey";
            columns: ["dev_profile_id"];
            isOneToOne: false;
            referencedRelation: "dev_profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      dev_profiles: {
        Row: {
          age: number | null;
          available: boolean;
          avatar_url: string | null;
          bio: string;
          created_at: string;
          education: string;
          email: string;
          full_name: string;
          github_login: string | null;
          github_url: string;
          github_verified: boolean;
          id: string;
          linkedin_url: string;
          score: number;
          seniority: Database["public"]["Enums"]["seniority"];
          stack: string[];
          status: Database["public"]["Enums"]["dev_status"];
          tier: Database["public"]["Enums"]["diamond_tier"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          age?: number | null;
          available?: boolean;
          avatar_url?: string | null;
          bio?: string;
          created_at?: string;
          education?: string;
          email: string;
          full_name: string;
          github_login?: string | null;
          github_url: string;
          github_verified?: boolean;
          id?: string;
          linkedin_url: string;
          score?: number;
          seniority?: Database["public"]["Enums"]["seniority"];
          stack?: string[];
          status?: Database["public"]["Enums"]["dev_status"];
          tier?: Database["public"]["Enums"]["diamond_tier"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          age?: number | null;
          available?: boolean;
          avatar_url?: string | null;
          bio?: string;
          created_at?: string;
          education?: string;
          email?: string;
          full_name?: string;
          github_login?: string | null;
          github_url?: string;
          github_verified?: boolean;
          id?: string;
          linkedin_url?: string;
          score?: number;
          seniority?: Database["public"]["Enums"]["seniority"];
          stack?: string[];
          status?: Database["public"]["Enums"]["dev_status"];
          tier?: Database["public"]["Enums"]["diamond_tier"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          created_at: string;
          follower_id: string;
          following_id: string;
        };
        Insert: {
          created_at?: string;
          follower_id: string;
          following_id: string;
        };
        Update: {
          created_at?: string;
          follower_id?: string;
          following_id?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          category: string;
          created_at: string;
          demo_url: string | null;
          description: string;
          id: string;
          image_url: string | null;
          price_cents: number;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          demo_url?: string | null;
          description: string;
          id?: string;
          image_url?: string | null;
          price_cents?: number;
          status?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          demo_url?: string | null;
          description?: string;
          id?: string;
          image_url?: string | null;
          price_cents?: number;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      post_comments: {
        Row: {
          blog_slug: string | null;
          content: string;
          created_at: string;
          id: string;
          post_id: string | null;
          user_id: string;
        };
        Insert: {
          blog_slug?: string | null;
          content: string;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          user_id: string;
        };
        Update: {
          blog_slug?: string | null;
          content?: string;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      post_reactions: {
        Row: {
          created_at: string;
          id: string;
          post_id: string;
          user_id: string;
          value: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          post_id: string;
          user_id: string;
          value: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          post_id?: string;
          user_id?: string;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "community_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          preferences: Json;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          preferences?: Json;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          preferences?: Json;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      subscription_events: {
        Row: {
          amount_cents: number | null;
          created_at: string;
          detail: string | null;
          id: string;
          kind: string;
          user_id: string;
        };
        Insert: {
          amount_cents?: number | null;
          created_at?: string;
          detail?: string | null;
          id?: string;
          kind: string;
          user_id: string;
        };
        Update: {
          amount_cents?: number | null;
          created_at?: string;
          detail?: string | null;
          id?: string;
          kind?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          amount_cents: number;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          payment_day: number | null;
          plan: Database["public"]["Enums"]["plan_type"];
          provider: string | null;
          provider_ref: string | null;
          status: Database["public"]["Enums"]["sub_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount_cents?: number;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          payment_day?: number | null;
          plan?: Database["public"]["Enums"]["plan_type"];
          provider?: string | null;
          provider_ref?: string | null;
          status?: Database["public"]["Enums"]["sub_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          payment_day?: number | null;
          plan?: Database["public"]["Enums"]["plan_type"];
          provider?: string | null;
          provider_ref?: string | null;
          status?: Database["public"]["Enums"]["sub_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      dev_profile_is_complete: {
        Args: { _p: Database["public"]["Tables"]["dev_profiles"]["Row"] };
        Returns: boolean;
      };
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "dev" | "cliente";
      dev_status: "em_analise" | "aprovado" | "rejeitado";
      diamond_tier: "negro" | "rosa" | "perolado" | "rubi" | "diamante_negro" | "elite";
      plan_type: "basico" | "elite";
      seniority: "estagiario" | "junior" | "pleno" | "senior" | "especialista";
      sub_status: "ativa" | "pendente" | "cancelada" | "expirada";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "dev", "cliente"],
      dev_status: ["em_analise", "aprovado", "rejeitado"],
      diamond_tier: ["negro", "rosa", "perolado", "rubi", "diamante_negro", "elite"],
      plan_type: ["basico", "elite"],
      seniority: ["estagiario", "junior", "pleno", "senior", "especialista"],
      sub_status: ["ativa", "pendente", "cancelada", "expirada"],
    },
  },
} as const;
