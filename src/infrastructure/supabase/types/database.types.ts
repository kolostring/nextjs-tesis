export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          title: string | null;
          user_patient_id: number;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          title?: string | null;
          user_patient_id: number;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          title?: string | null;
          user_patient_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "notes_user_patient_id_fkey";
            columns: ["user_patient_id"];
            isOneToOne: false;
            referencedRelation: "patients_users";
            referencedColumns: ["id"];
          },
        ];
      };
      patients: {
        Row: {
          created_at: string;
          created_by: string;
          date_of_birth: string;
          description: string | null;
          full_name: string;
          id: number;
        };
        Insert: {
          created_at?: string;
          created_by?: string;
          date_of_birth: string;
          description?: string | null;
          full_name: string;
          id?: number;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          date_of_birth?: string;
          description?: string | null;
          full_name?: string;
          id?: number;
        };
        Relationships: [];
      };
      patients_users: {
        Row: {
          created_at: string;
          id: number;
          patient_id: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          patient_id: number;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          patient_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patients_users_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      shared_patient_action: {
        Row: {
          created_at: string;
          created_by: string;
          id: number;
          share_code: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: number;
          share_code: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: number;
          share_code?: string;
        };
        Relationships: [];
      };
      shared_patient_action_patients: {
        Row: {
          action_id: number;
          created_at: string;
          id: number;
          patient_id: number | null;
        };
        Insert: {
          action_id: number;
          created_at?: string;
          id?: number;
          patient_id?: number | null;
        };
        Update: {
          action_id?: number;
          created_at?: string;
          id?: number;
          patient_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "shared_patient_action_patients_action_id_fkey";
            columns: ["action_id"];
            isOneToOne: false;
            referencedRelation: "shared_patient_action";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shared_patient_action_patients_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
      therapeutic_activity: {
        Row: {
          beginning_hour: string;
          created_at: string;
          day_of_block: number;
          description: string | null;
          end_hour: string;
          id: number;
          name: string;
          treatment_block_id: number;
        };
        Insert: {
          beginning_hour: string;
          created_at?: string;
          day_of_block: number;
          description?: string | null;
          end_hour: string;
          id?: number;
          name: string;
          treatment_block_id: number;
        };
        Update: {
          beginning_hour?: string;
          created_at?: string;
          day_of_block?: number;
          description?: string | null;
          end_hour?: string;
          id?: number;
          name?: string;
          treatment_block_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "therapeutic_activity_treatment_block_id_fkey";
            columns: ["treatment_block_id"];
            isOneToOne: false;
            referencedRelation: "treatment_blocks";
            referencedColumns: ["id"];
          },
        ];
      };
      treatment_blocks: {
        Row: {
          beginning_date: string;
          created_at: string;
          duration_days: number;
          id: number;
          iterations: number;
          treatment_id: number;
        };
        Insert: {
          beginning_date: string;
          created_at?: string;
          duration_days: number;
          id?: number;
          iterations: number;
          treatment_id: number;
        };
        Update: {
          beginning_date?: string;
          created_at?: string;
          duration_days?: number;
          id?: number;
          iterations?: number;
          treatment_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "treatment_blocks_treatment_id_fkey";
            columns: ["treatment_id"];
            isOneToOne: false;
            referencedRelation: "treatments";
            referencedColumns: ["id"];
          },
        ];
      };
      treatments: {
        Row: {
          created_at: string;
          description: string | null;
          eye_condition: string;
          id: number;
          name: string;
          patient_id: number;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          eye_condition: string;
          id?: number;
          name: string;
          patient_id: number;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          eye_condition?: string;
          id?: number;
          name?: string;
          patient_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "treatments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_share_patients: {
        Args: { p_share_code: string };
        Returns: undefined;
      };
      create_share_patients: {
        Args: { p_patient_ids: number[] };
        Returns: string;
      };
      get_patient_by_id: {
        Args: { p_id: number };
        Returns: Json;
      };
      get_patients_list: {
        Args: { p_ids?: number[] };
        Returns: Database["public"]["CompositeTypes"]["patient_output"][];
      };
      insert_full_treatment: {
        Args: {
          p_patient_id: number;
          p_eye_condition: string;
          p_name: string;
          p_description: string;
          p_blocks: Database["public"]["CompositeTypes"]["treatment_block_input"][];
        };
        Returns: number;
      };
      update_full_treatment: {
        Args: {
          p_treatment_id: number;
          p_eye_condition?: string;
          p_name?: string;
          p_description?: string;
          p_blocks?: Database["public"]["CompositeTypes"]["treatment_block_input"][];
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      patient_output: {
        id: number | null;
        full_name: string | null;
        date_of_birth: string | null;
        description: string | null;
        treatments:
          | Database["public"]["CompositeTypes"]["treatment_output"][]
          | null;
      };
      therapeutic_activity_input: {
        name: string | null;
        description: string | null;
        day_of_block: number | null;
        beginning_hour: string | null;
        end_hour: string | null;
      };
      therapeutic_activity_output: {
        name: string | null;
        description: string | null;
        day_of_block: number | null;
        beginning_hour: string | null;
        end_hour: string | null;
      };
      treatment_block_input: {
        beginning_date: string | null;
        duration_days: number | null;
        iterations: number | null;
        activities:
          | Database["public"]["CompositeTypes"]["therapeutic_activity_input"][]
          | null;
      };
      treatment_block_output: {
        beginning_date: string | null;
        duration_days: number | null;
        iterations: number | null;
        therapeutic_activities:
          | Database["public"]["CompositeTypes"]["therapeutic_activity_output"][]
          | null;
      };
      treatment_output: {
        id: number | null;
        eye_condition: string | null;
        name: string | null;
        description: string | null;
        treatment_blocks:
          | Database["public"]["CompositeTypes"]["treatment_block_output"][]
          | null;
      };
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
