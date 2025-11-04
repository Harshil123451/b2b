/**
 * Supabase Client Configuration
 * Creates a client-side Supabase client for use in Next.js
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database type definitions
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          role: 'client' | 'provider';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          role: 'client' | 'provider';
        };
        Update: {
          name?: string;
          role?: 'client' | 'provider';
        };
      };
      requests: {
        Row: {
          id: string;
          user_id: string;
          service_type: string;
          description: string;
          status: 'open' | 'closed' | 'awarded';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          service_type: string;
          description: string;
          status?: 'open' | 'closed' | 'awarded';
        };
        Update: {
          service_type?: string;
          description?: string;
          status?: 'open' | 'closed' | 'awarded';
        };
      };
      offers: {
        Row: {
          id: string;
          request_id: string;
          provider_id: string;
          price: number;
          delivery_time: number;
          message: string;
          status: 'pending' | 'accepted' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          request_id: string;
          provider_id: string;
          price: number;
          delivery_time: number;
          message: string;
          status?: 'pending' | 'accepted' | 'rejected';
        };
        Update: {
          price?: number;
          delivery_time?: number;
          message?: string;
          status?: 'pending' | 'accepted' | 'rejected';
        };
      };
    };
  };
}

