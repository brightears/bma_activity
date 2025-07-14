import { createServerSupabaseClient, handleSupabaseError } from '../../lib/supabase.js';

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient();
  
  // Use default user for all operations
  const defaultUser = {
    id: '00000000-0000-0000-0000-000000000000',
    profile: {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'team@bmasiapte.com',
      username: 'BMA Team',
      full_name: 'BMA Team',
      role: 'admin'
    }
  };

  switch (req.method) {
    case 'GET':
      return handleGetReports(req, res, supabase, defaultUser);
    case 'POST':
      return handleCreateReport(req, res, supabase, defaultUser);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetReports(req, res, supabase, user) {
  try {
    const { week_number, year, user_id } = req.query;
    
    let query = supabase
      .from('report_summary')
      .select('*');

    // Apply filters
    if (week_number) {
      query = query.eq('week_number', week_number);
    }
    if (year) {
      query = query.eq('year', year);
    }
    
    // Admin user can filter by user_id if provided
    if (user_id) {
      query = query.eq('created_by', user_id);
    }

    const { data, error } = await query.order('year', { ascending: false })
      .order('week_number', { ascending: false });

    if (error) {
      const { status, message } = handleSupabaseError(error);
      return res.status(status).json({ error: message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleCreateReport(req, res, supabase, user) {
  try {
    const { week_number, year } = req.body;

    if (!week_number || !year) {
      return res.status(400).json({ 
        error: 'Week number and year are required' 
      });
    }

    // Create the report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        week_number,
        year,
        created_by: user.profile.id
      })
      .select()
      .single();

    if (reportError) {
      const { status, message } = handleSupabaseError(reportError);
      return res.status(status).json({ error: message });
    }

    return res.status(201).json(report);
  } catch (error) {
    console.error('Create report error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}