import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || (process.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (process.env.VITE_SUPABASE_ANON_KEY as string) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your Secrets panel.');
}

let client;
try {
  client = createClient(
    supabaseUrl || 'https://placeholder.supabase.co', 
    supabaseAnonKey || 'placeholder'
  );
} catch (e) {
  console.error('Failed to initialize Supabase client:', e);
  // Fallback to a dummy client that doesn't crash on method calls
  client = {
    from: () => ({
      select: () => ({ 
        order: () => Promise.resolve({ data: [], error: null }),
        eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) })
      }),
      insert: () => Promise.resolve({ error: null }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
    channel: () => ({ 
      on: () => ({ 
        subscribe: () => ({}) 
      }) 
    }),
    removeChannel: () => {},
  } as any;
}

export const supabase = client;
