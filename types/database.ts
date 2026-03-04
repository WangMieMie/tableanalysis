export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_datasets: {
        Row: {
          id: string
          user_id: string
          name: string
          columns: Json
          data: Json
          row_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          columns: Json
          data: Json
          row_count: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          columns?: Json
          data?: Json
          row_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      charts: {
        Row: {
          id: string
          user_id: string
          dataset_id: string
          config: Json
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dataset_id: string
          config: Json
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dataset_id?: string
          config?: Json
          name?: string
          created_at?: string
        }
      }
      analysis_reports: {
        Row: {
          id: string
          user_id: string
          dataset_id: string
          overview: string
          statistics: string
          quality: string
          trends: string
          recommendations: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dataset_id: string
          overview: string
          statistics: string
          quality: string
          trends: string
          recommendations: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dataset_id?: string
          overview?: string
          statistics?: string
          quality?: string
          trends?: string
          recommendations?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string
          current_period_end: string | null
          plan: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          current_period_end?: string | null
          plan?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          current_period_end?: string | null
          plan?: string
          created_at?: string
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}