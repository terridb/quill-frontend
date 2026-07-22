export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          created_at: string;
          id: string;
          prompt: string;
          recommendation: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          prompt: string;
          recommendation?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          prompt?: string;
          recommendation?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      books: {
        Row: {
          api_id: string;
          author: string | null;
          cover_url: string | null;
          created_at: string;
          description: string | null;
          genres: string[] | null;
          id: string;
          isbn: string | null;
          language: string | null;
          page_count: number | null;
          published_date: string | null;
          search_document: unknown;
          shelf_count: number;
          tags: string[] | null;
          title: string;
        };
        Insert: {
          api_id: string;
          author?: string | null;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          genres?: string[] | null;
          id?: string;
          isbn?: string | null;
          language?: string | null;
          page_count?: number | null;
          published_date?: string | null;
          search_document?: unknown;
          shelf_count?: number;
          tags?: string[] | null;
          title: string;
        };
        Update: {
          api_id?: string;
          author?: string | null;
          cover_url?: string | null;
          created_at?: string;
          description?: string | null;
          genres?: string[] | null;
          id?: string;
          isbn?: string | null;
          language?: string | null;
          page_count?: number | null;
          published_date?: string | null;
          search_document?: unknown;
          shelf_count?: number;
          tags?: string[] | null;
          title?: string;
        };
        Relationships: [];
      };
      list_entries: {
        Row: {
          added_at: string;
          book_id: string;
          current_page: number | null;
          finished_at: string | null;
          id: string;
          list_id: string;
          page_count: number | null;
          started_at: string | null;
        };
        Insert: {
          added_at?: string;
          book_id: string;
          current_page?: number | null;
          finished_at?: string | null;
          id?: string;
          list_id: string;
          page_count?: number | null;
          started_at?: string | null;
        };
        Update: {
          added_at?: string;
          book_id?: string;
          current_page?: number | null;
          finished_at?: string | null;
          id?: string;
          list_id?: string;
          page_count?: number | null;
          started_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "list_entries_book_id_fkey";
            columns: ["book_id"];
            isOneToOne: false;
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "list_entries_list_id_fkey";
            columns: ["list_id"];
            isOneToOne: false;
            referencedRelation: "lists";
            referencedColumns: ["id"];
          },
        ];
      };
      lists: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_default: boolean;
          is_private: boolean;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_default?: boolean;
          is_private?: boolean;
          name: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_default?: boolean;
          is_private?: boolean;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          setup_complete: boolean;
          user_id: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          setup_complete?: boolean;
          user_id: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          setup_complete?: boolean;
          user_id?: string;
          username?: string;
        };
        Relationships: [];
      };
      reading_logs: {
        Row: {
          created_at: string;
          id: string;
          list_entry_id: string;
          logged_date: string;
          pages_read: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          list_entry_id: string;
          logged_date?: string;
          pages_read?: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          list_entry_id?: string;
          logged_date?: string;
          pages_read?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reading_logs_list_entry_id_fkey";
            columns: ["list_entry_id"];
            isOneToOne: false;
            referencedRelation: "list_entries";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_documents: {
        Args: { match_count?: number; query_embedding: string };
        Returns: {
          content: string;
          id: string;
          similarity: number;
          title: string;
        }[];
      };
      rebuild_search_index: { Args: never; Returns: undefined };
      search_books: {
        Args: { result_limit?: number; search_query: string };
        Returns: {
          api_id: string;
          author: string | null;
          cover_url: string | null;
          language: string | null;
          score: number;
          title: string;
        }[];
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
    };
    Enums: {
      [_ in never]: never;
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
