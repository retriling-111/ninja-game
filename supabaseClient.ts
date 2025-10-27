import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Declaring `process` to satisfy TypeScript in a client-side environment
// that exposes secrets via a polyfilled `process.env` object.
declare const process: {
  env: {
    [key: string]: string | undefined
  }
};

// The application runs in an environment where secrets are exposed on `process.env`.
// Use environment variables if they exist, otherwise use a mock client.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('ywdkywywqfuyubhhwwqz')) {
  console.warn(
    `Supabase environment variables not found or are placeholders! 
    App will run in offline-only mode. Saving and loading progress across sessions will not work.
    To enable database features, ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your project's secrets.`
  );
  
  // Create a dummy client that will fail gracefully, allowing offline mode to function.
  const dummySupabase = {
    from: (_tableName: string) => ({
      upsert: () => Promise.resolve({ error: { message: 'Supabase not configured', code: 'NO_CREDS', details: '', hint: '' } }),
      select: (_columns: string) => ({
        eq: (_column: string, _value: any) => ({
          single: () => Promise.resolve({ error: { message: 'Supabase not configured', code: 'NO_CREDS', details: '', hint: '' } }),
        }),
      }),
    }),
  };
  supabaseClient = dummySupabase as any; // Cast to any to satisfy the SupabaseClient type

} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;
