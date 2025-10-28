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
  const mockError = { message: 'Supabase not configured', code: 'NO_CREDS', details: '', hint: '' };
  
  // A mock query builder that allows chaining and returns a mock error.
  const dummyQueryBuilder = {
    // Chainable methods
    eq: function() { return this; },
    order: function() { return this; },
    limit: function() { return this; },

    // Finalizers that return a promise
    single: () => Promise.resolve({ data: null, error: mockError }),
    
    // The query builder itself is "thenable" for `await`
    then: function(resolve: (value: { data: null, error: typeof mockError }) => void) {
      resolve({ data: null, error: mockError });
    }
  };

  const dummySupabase = {
    from: (_tableName: string) => ({
      upsert: () => Promise.resolve({ error: mockError }),
      select: (_columns: string) => dummyQueryBuilder,
    }),
  };

  supabaseClient = dummySupabase as any; // Cast to any to satisfy the SupabaseClient type

} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = supabaseClient;