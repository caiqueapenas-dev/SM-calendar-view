// Updated database types with new tables and fields

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string;
          name: string;
          profile_picture_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          profile_picture_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          profile_picture_url?: string | null;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          client_id: string;
          name: string;
          custom_name: string | null;
          email: string;
          profile_picture_url: string | null;
          is_active: boolean;
          brand_color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id?: string;
          name: string;
          custom_name?: string | null;
          email: string;
          profile_picture_url?: string | null;
          is_active?: boolean;
          brand_color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          name?: string;
          custom_name?: string | null;
          email?: string;
          profile_picture_url?: string | null;
          is_active?: boolean;
          brand_color?: string | null;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          client_id: string;
          caption: string | null;
          media_url: string;
          thumbnail_url: string | null;
          media_type: string;
          platforms: string[];
          status: string;
          scheduled_at: string;
          edit_history: any[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          caption?: string | null;
          media_url: string;
          thumbnail_url?: string | null;
          media_type: string;
          platforms: string[];
          status?: string;
          scheduled_at: string;
          edit_history?: any[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          caption?: string | null;
          media_url?: string;
          thumbnail_url?: string | null;
          media_type?: string;
          platforms?: string[];
          status?: string;
          scheduled_at?: string;
          edit_history?: any[] | null;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: "admin" | "client";
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: "admin" | "client";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "admin" | "client";
        };
      };
      // ... rest of tables remain the same
    };
  };
};

export type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

