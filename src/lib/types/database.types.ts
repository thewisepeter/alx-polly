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
      polls: {
        Row: {
          id: string
          title: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
          is_public: boolean
          allow_anonymous_votes: boolean
          end_date: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          is_public?: boolean
          allow_anonymous_votes?: boolean
          end_date?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          is_public?: boolean
          allow_anonymous_votes?: boolean
          end_date?: string | null
        }
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          option_text: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_text?: string
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          poll_id: string
          option_id: string
          user_id: string | null
          anonymous_user_id: string | null
          created_at: string
          ip_address: string | null
        }
        Insert: {
          id?: string
          poll_id: string
          option_id: string
          user_id?: string | null
          anonymous_user_id?: string | null
          created_at?: string
          ip_address?: string | null
        }
        Update: {
          id?: string
          poll_id?: string
          option_id?: string
          user_id?: string | null
          anonymous_user_id?: string | null
          created_at?: string
          ip_address?: string | null
        }
      }
      poll_shares: {
        Row: {
          id: string
          poll_id: string
          created_by: string | null
          share_code: string
          created_at: string
          expires_at: string | null
          password: string | null
        }
        Insert: {
          id?: string
          poll_id: string
          created_by?: string | null
          share_code: string
          created_at?: string
          expires_at?: string | null
          password?: string | null
        }
        Update: {
          id?: string
          poll_id?: string
          created_by?: string | null
          share_code?: string
          created_at?: string
          expires_at?: string | null
          password?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_poll_results: {
        Args: {
          poll_id: string
        }
        Returns: {
          option_id: string
          option_text: string
          vote_count: number
        }[]
      }
      has_user_voted: {
        Args: {
          poll_id: string
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for Supabase functions
export type PollResult = Database['public']['Functions']['get_poll_results']['Returns'][0]

// Convenience types for tables
export type Poll = Database['public']['Tables']['polls']['Row']
export type NewPoll = Database['public']['Tables']['polls']['Insert']
export type UpdatePoll = Database['public']['Tables']['polls']['Update']

export type PollOption = Database['public']['Tables']['poll_options']['Row']
export type NewPollOption = Database['public']['Tables']['poll_options']['Insert']
export type UpdatePollOption = Database['public']['Tables']['poll_options']['Update']

export type Vote = Database['public']['Tables']['votes']['Row']
export type NewVote = Database['public']['Tables']['votes']['Insert']
export type UpdateVote = Database['public']['Tables']['votes']['Update']

export type PollShare = Database['public']['Tables']['poll_shares']['Row']
export type NewPollShare = Database['public']['Tables']['poll_shares']['Insert']
export type UpdatePollShare = Database['public']['Tables']['poll_shares']['Update']