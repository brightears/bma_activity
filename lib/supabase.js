import { createClient } from '@supabase/supabase-js';

// Supabase client for backend (server-side) use
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Supabase client for frontend (client-side) use
export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Helper function to get user from request (for serverless functions)
export async function getUserFromRequest(req, supabase) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { user: null, error: 'No authorization token provided' };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      return { user: null, error: error.message };
    }

    // Get the user's profile from our users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (profileError) {
      return { user: null, error: 'User profile not found' };
    }

    return { user: { ...user, profile }, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
}

// Helper function to handle Supabase errors
export function handleSupabaseError(error) {
  if (error.code === '23505') {
    return { status: 409, message: 'Record already exists' };
  }
  if (error.code === '23503') {
    return { status: 400, message: 'Invalid reference' };
  }
  if (error.code === 'PGRST301') {
    return { status: 404, message: 'Record not found' };
  }
  if (error.code === '42501') {
    return { status: 403, message: 'Insufficient permissions' };
  }
  
  return { status: 500, message: error.message || 'Internal server error' };
}