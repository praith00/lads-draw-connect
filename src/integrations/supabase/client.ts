import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create mock client for when Supabase isn't connected
const mockSupabaseClient = {
  auth: {
    signUp: () => Promise.resolve({ error: { message: 'Please connect Supabase integration first' } }),
    signInWithPassword: () => Promise.resolve({ error: { message: 'Please connect Supabase integration first' } }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null } }),
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
};

export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? mockSupabaseClient 
  : createClient(supabaseUrl, supabaseAnonKey);

// Log warning if Supabase isn't properly connected
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Please connect Supabase integration.');
}