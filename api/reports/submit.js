import { createServerSupabaseClient, handleSupabaseError } from '../../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  try {
    const {
      week_number,
      year,
      sales_items = [],
      music_items = [],
      tech_items = [],
      challenges = [],
      priorities = []
    } = req.body;

    // Validate required fields
    if (!week_number || !year) {
      return res.status(400).json({ 
        error: 'Week number and year are required' 
      });
    }

    // Check if report already exists
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('week_number', week_number)
      .eq('year', year)
      .eq('created_by', defaultUser.profile.id)
      .single();

    let reportId;

    if (existingReport) {
      // Update existing report
      reportId = existingReport.id;
      
      // Delete all existing items
      await Promise.all([
        supabase.from('sales_items').delete().eq('report_id', reportId),
        supabase.from('music_items').delete().eq('report_id', reportId),
        supabase.from('tech_items').delete().eq('report_id', reportId),
        supabase.from('challenges').delete().eq('report_id', reportId),
        supabase.from('priorities').delete().eq('report_id', reportId)
      ]);
    } else {
      // Create new report
      const { data: newReport, error: createError } = await supabase
        .from('reports')
        .insert({
          week_number,
          year,
          created_by: defaultUser.profile.id
        })
        .select()
        .single();

      if (createError) {
        const { status, message } = handleSupabaseError(createError);
        return res.status(status).json({ error: message });
      }

      reportId = newReport.id;
    }

    // Insert all items
    const insertPromises = [];

    // Insert sales items
    if (sales_items.length > 0) {
      const salesData = sales_items.map(item => ({
        report_id: reportId,
        date: item.date || new Date().toISOString().split('T')[0],
        status: item.status,
        region: item.region || 'INT',
        description: item.description,
        zones: item.zones,
        yearly_value: item.yearly_value || 0,
        team_member: item.team_member || defaultUser.profile.full_name
      }));
      insertPromises.push(
        supabase.from('sales_items').insert(salesData)
      );
    }

    // Insert music items
    if (music_items.length > 0) {
      const musicData = music_items.map(item => ({
        report_id: reportId,
        date: item.date || new Date().toISOString().split('T')[0],
        description: item.description,
        team_member: item.team_member || defaultUser.profile.full_name
      }));
      insertPromises.push(
        supabase.from('music_items').insert(musicData)
      );
    }

    // Insert tech items
    if (tech_items.length > 0) {
      const techData = tech_items.map(item => ({
        report_id: reportId,
        date: item.date || new Date().toISOString().split('T')[0],
        description: item.description,
        team_member: item.team_member || defaultUser.profile.full_name
      }));
      insertPromises.push(
        supabase.from('tech_items').insert(techData)
      );
    }

    // Insert challenges
    if (challenges.length > 0) {
      const challengesData = challenges.map(item => ({
        report_id: reportId,
        description: typeof item === 'string' ? item : item.description
      }));
      insertPromises.push(
        supabase.from('challenges').insert(challengesData)
      );
    }

    // Insert priorities
    if (priorities.length > 0) {
      const prioritiesData = priorities.map(item => ({
        report_id: reportId,
        description: typeof item === 'string' ? item : item.description
      }));
      insertPromises.push(
        supabase.from('priorities').insert(prioritiesData)
      );
    }

    // Execute all inserts
    const results = await Promise.all(insertPromises);
    
    // Check for errors
    for (const result of results) {
      if (result.error) {
        const { status, message } = handleSupabaseError(result.error);
        return res.status(status).json({ error: message });
      }
    }

    // Get the complete report with all items
    const { data: completeReport, error: fetchError } = await supabase
      .from('reports')
      .select(`
        *,
        sales_items (*),
        music_items (*),
        tech_items (*),
        challenges (*),
        priorities (*),
        users (username, email, full_name)
      `)
      .eq('id', reportId)
      .single();

    if (fetchError) {
      const { status, message } = handleSupabaseError(fetchError);
      return res.status(status).json({ error: message });
    }

    // Calculate summary statistics
    const summary = {
      total_sales: completeReport.sales_items.length,
      total_music: completeReport.music_items.length,
      total_tech: completeReport.tech_items.length,
      total_yearly_value: completeReport.sales_items.reduce((sum, item) => sum + (item.yearly_value || 0), 0),
      total_mrr: completeReport.sales_items.reduce((sum, item) => sum + (item.yearly_value || 0), 0) / 12,
      int_yearly_value: completeReport.sales_items.filter(item => item.region === 'INT').reduce((sum, item) => sum + (item.yearly_value || 0), 0),
      th_yearly_value: completeReport.sales_items.filter(item => item.region === 'TH').reduce((sum, item) => sum + (item.yearly_value || 0), 0)
    };

    return res.status(existingReport ? 200 : 201).json({
      report: completeReport,
      summary,
      message: existingReport ? 'Report updated successfully' : 'Report created successfully'
    });
  } catch (error) {
    console.error('Submit report error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}