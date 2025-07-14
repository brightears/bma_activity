// Authentication is disabled - this endpoint is not in use
/*
import { createServerSupabaseClient } from '../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, username, full_name } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ 
      error: 'Email, password, and username are required' 
    });
  }

  try {
    const supabase = createServerSupabaseClient();
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: full_name || username
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // The user profile will be created automatically by our database trigger
    // Just return success
    return res.status(201).json({
      message: 'User created successfully. Please check your email to verify your account.',
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
*/

export default async function handler(req, res) {
  return res.status(404).json({ error: 'Authentication is disabled' });
}