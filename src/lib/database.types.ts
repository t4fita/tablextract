export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          subscription_tier: string;
          subscription_start: string;
          subscription_end: string | null;
          usage_data: Json;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          subscription_tier?: string;
          subscription_start?: string;
          subscription_end?: string | null;
          usage_data?: Json;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          subscription_tier?: string;
          subscription_start?: string;
          subscription_end?: string | null;
          usage_data?: Json;
        };
      };
      extractions: {
        Row: {
          id: string;
          user_id: string;
          extraction_data: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          extraction_data: Json;
          metadata: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          extraction_data?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 