import { createClient } from '@supabase/supabase-js';

// ==========================================
// SUPABASE CLIENT INITIALIZATION
// ==========================================

// Get environment variables - handle both Vite (import.meta.env) and webpack (global)
const getEnv = (key, fallback = '') => {
  // Try Vite's import.meta.env first
  if (typeof importMetaEnv !== 'undefined') {
    return importMetaEnv[key] || fallback;
  }
  // Try webpack's process.env
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // Try globalThis
  if (typeof globalThis !== 'undefined' && globalThis[key]) {
    return globalThis[key];
  }
  return fallback;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL', 'https://tjithxamxbcdagnszyfq.supabase.co');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaXRoeGFteGJjZGFnbnN6eWZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDkxNjksImV4cCI6MjA4MTYyNTE2OX0.M5KUns5NPyRQ2QdkAI3w6fvEp0RDSucgjGvtz7G9vvg');

// Debug log (remove in production)
console.log('Supabase URL:', supabaseUrl ? 'present' : 'missing');
console.log('Supabase Key:', supabaseAnonKey ? 'present' : 'missing');

// Create a mock client for development/demo when credentials are missing
let supabase;

try {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl.includes('supabase.co')) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized with credentials');
  } else {
    console.log('Supabase credentials missing - using mock client for demo mode');
    // Create a mock supabase client that won't crash the app
    supabase = {
      from: () => ({
        select: () => ({ data: null, error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
        eq: () => ({ single: () => ({ data: null, error: null }) }),
        order: () => ({ data: [], error: null }),
      }),
      auth: {
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Auth not configured' } }),
        signUp: () => Promise.resolve({ data: null, error: { message: 'Auth not configured' } }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      channel: () => ({
        on: () => ({ subscribe: () => {} }),
      }),
    };
  }
} catch (error) {
  console.warn('Supabase initialization failed, using mock client:', error.message);
  supabase = {
    from: () => ({
      select: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => ({ single: () => ({ data: null, error: null }) }),
      order: () => ({ data: [], error: null }),
    }),
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Auth not configured' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Auth not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  };
}

// Database table names
export const TABLES = {
  PROFILES: 'profiles',
  WALLETS: 'wallets',
  TRANSACTIONS: 'transactions',
  PPP_DATA: 'ppp_data',
  BASKETS: 'baskets',
};

export { supabase };
export default supabase;
