import { createServerSupabaseClient, handleSupabaseError } from '../../lib/supabase.js';

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient();
  const { id } = req.query;
  
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
      return handleGetReport(req, res, supabase, defaultUser, id);
    case 'PUT':
      return handleUpdateReport(req, res, supabase, defaultUser, id);
    case 'DELETE':
      return handleDeleteReport(req, res, supabase, defaultUser, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetReport(req, res, supabase, user, reportId) {
  try {
    // Get the report
    const { data: report, error: reportError } = await supabase
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

    if (reportError) {
      const { status, message } = handleSupabaseError(reportError);
      return res.status(status).json({ error: message });
    }

    // No permission check needed - admin user has access to all reports

    return res.status(200).json(report);
  } catch (error) {
    console.error('Get report error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleUpdateReport(req, res, supabase, user, reportId) {
  try {
    const updateData = req.body;

    // Start a transaction-like operation
    const updates = [];

    // Update sales items if provided
    if (updateData.sales_items) {
      // Delete existing items
      updates.push(
        supabase.from('sales_items').delete().eq('report_id', reportId)
      );
      
      // Insert new items
      if (updateData.sales_items.length > 0) {
        const salesItems = updateData.sales_items.map(item => ({
          ...item,
          report_id: reportId
        }));
        updates.push(
          supabase.from('sales_items').insert(salesItems)
        );
      }
    }

    // Update music items if provided
    if (updateData.music_items) {
      updates.push(
        supabase.from('music_items').delete().eq('report_id', reportId)
      );
      
      if (updateData.music_items.length > 0) {
        const musicItems = updateData.music_items.map(item => ({
          ...item,
          report_id: reportId
        }));
        updates.push(
          supabase.from('music_items').insert(musicItems)
        );
      }
    }

    // Update tech items if provided
    if (updateData.tech_items) {
      updates.push(
        supabase.from('tech_items').delete().eq('report_id', reportId)
      );
      
      if (updateData.tech_items.length > 0) {
        const techItems = updateData.tech_items.map(item => ({
          ...item,
          report_id: reportId
        }));
        updates.push(
          supabase.from('tech_items').insert(techItems)
        );
      }
    }

    // Update challenges if provided
    if (updateData.challenges) {
      updates.push(
        supabase.from('challenges').delete().eq('report_id', reportId)
      );
      
      if (updateData.challenges.length > 0) {
        const challenges = updateData.challenges.map(item => ({
          description: item.description || item,
          report_id: reportId
        }));
        updates.push(
          supabase.from('challenges').insert(challenges)
        );
      }
    }

    // Update priorities if provided
    if (updateData.priorities) {
      updates.push(
        supabase.from('priorities').delete().eq('report_id', reportId)
      );
      
      if (updateData.priorities.length > 0) {
        const priorities = updateData.priorities.map(item => ({
          description: item.description || item,
          report_id: reportId
        }));
        updates.push(
          supabase.from('priorities').insert(priorities)
        );
      }
    }

    // Execute all updates
    const results = await Promise.all(updates);
    
    // Check for errors
    for (const result of results) {
      if (result.error) {
        const { status, message } = handleSupabaseError(result.error);
        return res.status(status).json({ error: message });
      }
    }

    // Return the updated report
    return handleGetReport(req, res, supabase, user, reportId);
  } catch (error) {
    console.error('Update report error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDeleteReport(req, res, supabase, user, reportId) {
  try {
    // Check ownership first
    const { data: report, error: checkError } = await supabase
      .from('reports')
      .select('created_by')
      .eq('id', reportId)
      .single();

    if (checkError || !report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // No permission check needed - admin user has access to all reports

    // Delete the report (cascade will handle related items)
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (error) {
      const { status, message } = handleSupabaseError(error);
      return res.status(status).json({ error: message });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Delete report error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}