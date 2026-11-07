import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_SUPABASE_URL is not set. Please add it to your .env.local file.');
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
