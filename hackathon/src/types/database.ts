export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          author_id: string // Auth0 user ID (primary key)
          given_name: string | null
          family_name: string | null
          nickname: string | null
          email_verified: boolean
          created_at: string
          updated_at: string
          full_name: string | null
          email: string
          picture: string | null
          connection: string | null
          // Our custom fields
          address: string | null
          zip: string | null
          verified_resident: boolean
        }
        Insert: {
          author_id?: string // Auth0 user ID (primary key)
          given_name?: string | null
          family_name?: string | null
          nickname?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
          full_name?: string | null
          email: string
          picture?: string | null
          connection?: string | null
          // Our custom fields
          address?: string | null
          zip?: string | null
          verified_resident?: boolean
        }
        Update: {
          author_id?: string // Auth0 user ID (primary key)
          given_name?: string | null
          family_name?: string | null
          nickname?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
          full_name?: string | null
          email?: string
          picture?: string | null
          connection?: string | null
          // Our custom fields
          address?: string | null
          zip?: string | null
          verified_resident?: boolean
        }
        Relationships: []
      }
      proposals: {
        Row: {
          id: string // UUID stored as string
          author_id: string
          title: string
          summary: string
          body_md: string | null
          category: string // Changed from enum to text for flexibility
          scope_verified: boolean
          status: string // Changed from enum to text for flexibility
          upvotes: number
          downvotes: number
          location_hint: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string // UUID stored as string
          author_id: string
          title: string
          summary: string
          body_md?: string | null
          category: string // Changed from enum to text for flexibility
          scope_verified?: boolean
          status?: string // Changed from enum to text for flexibility
          upvotes?: number
          downvotes?: number
          location_hint?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string // UUID stored as string
          author_id?: string
          title?: string
          summary?: string
          body_md?: string | null
          category?: string // Changed from enum to text for flexibility
          scope_verified?: boolean
          status?: string // Changed from enum to text for flexibility
          upvotes?: number
          downvotes?: number
          location_hint?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["author_id"]
          }
        ]
      }
      votes: {
        Row: {
          id: string // UUID stored as string
          proposal_id: string // UUID stored as string
          author_id: string // Auth0 user ID
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string // UUID stored as string
          proposal_id: string // UUID stored as string
          author_id: string // Auth0 user ID
          vote_type?: 'up' | 'down'
          created_at?: string
        }
        Update: {
          id?: string // UUID stored as string
          proposal_id?: string // UUID stored as string
          author_id?: string // Auth0 user ID
          vote_type?: 'up' | 'down'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["author_id"]
          }
        ]
      }
      road_reports: {
        Row: {
          id: string // UUID stored as string
          user_id: string // Auth0 user ID
          geom: any // PostGIS Point type
          street_name: string | null
          description: string
          media_urls: string[] | null
          created_at: string
        }
        Insert: {
          id?: string // UUID stored as string
          user_id: string // Auth0 user ID
          geom: any // PostGIS Point type
          street_name?: string | null
          description: string
          media_urls?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string // UUID stored as string
          user_id?: string // Auth0 user ID
          geom?: any // PostGIS Point type
          street_name?: string | null
          description?: string
          media_urls?: string[] | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "road_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["author_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cast_vote: {
        Args: {
          proposal_id: string
          vote_direction?: 'up' | 'down'
        }
        Returns: {
          success: boolean
          message: string
          vote_type: 'up' | 'down' | null
        }
      }
      get_road_reports_in_bbox: {
        Args: {
          min_lng: number
          min_lat: number
          max_lng: number
          max_lat: number
        }
        Returns: {
          id: string
          user_id: string
          street_name: string | null
          description: string
          media_urls: string[] | null
          created_at: string
          lng: number
          lat: number
        }[]
      }
    }
    Enums: {
      proposal_category: 'Roads' | 'Sanitation' | 'Parks' | 'Safety' | 'Zoning' | 'Other'
      proposal_status: 'draft' | 'published' | 'petitioning' | 'approved' | 'rejected'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Proposal = Database['public']['Tables']['proposals']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type RoadReport = Database['public']['Tables']['road_reports']['Row']

export type ProposalInsert = Database['public']['Tables']['proposals']['Insert']
export type VoteInsert = Database['public']['Tables']['votes']['Insert']
export type RoadReportInsert = Database['public']['Tables']['road_reports']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type ProposalCategory = Database['public']['Enums']['proposal_category']
export type ProposalStatus = Database['public']['Enums']['proposal_status']

// API response types
export interface CastVoteResponse {
  success: boolean
  message: string
}

export interface RoadReportWithCoords {
  id: string
  user_id: string
  street_name: string | null
  description: string
  media_urls: string[] | null
  created_at: string
  lng: number
  lat: number
}
