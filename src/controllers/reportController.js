import { validationResult } from 'express-validator';
import { pool } from '../config/database.js';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

// Get all reports with pagination
export const getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const countQuery = 'SELECT COUNT(*) FROM reports';
    const countResult = await pool.query(countQuery);
    const totalReports = parseInt(countResult.rows[0].count);

    const reportsQuery = `
      SELECT 
        r.id,
        r.week_number,
        r.year,
        r.created_at,
        u.full_name as created_by_name,
        u.email as created_by_email,
        COUNT(DISTINCT s.id) as sales_count,
        COUNT(DISTINCT m.id) as music_count,
        COUNT(DISTINCT t.id) as tech_count,
        COALESCE(SUM(s.yearly_value), 0) as total_yearly_value
      FROM reports r
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN sales_items s ON r.id = s.report_id
      LEFT JOIN music_items m ON r.id = m.report_id
      LEFT JOIN tech_items t ON r.id = t.report_id
      GROUP BY r.id, r.week_number, r.year, r.created_at, u.full_name, u.email
      ORDER BY r.year DESC, r.week_number DESC
      LIMIT $1 OFFSET $2
    `;
    
    const reportsResult = await pool.query(reportsQuery, [limit, offset]);

    res.json({
      reports: reportsResult.rows,
      pagination: {
        page,
        limit,
        totalReports,
        totalPages: Math.ceil(totalReports / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

// Get reports for current user
export const getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const reportsQuery = `
      SELECT 
        r.id,
        r.week_number,
        r.year,
        r.created_at,
        COUNT(DISTINCT s.id) as sales_count,
        COUNT(DISTINCT m.id) as music_count,
        COUNT(DISTINCT t.id) as tech_count,
        COALESCE(SUM(s.yearly_value), 0) as total_yearly_value
      FROM reports r
      LEFT JOIN sales_items s ON r.id = s.report_id
      LEFT JOIN music_items m ON r.id = m.report_id
      LEFT JOIN tech_items t ON r.id = t.report_id
      WHERE r.created_by = $1
      GROUP BY r.id, r.week_number, r.year, r.created_at
      ORDER BY r.year DESC, r.week_number DESC
    `;
    
    const reportsResult = await pool.query(reportsQuery, [userId]);
    res.json(reportsResult.rows);
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ message: 'Error fetching reports' });
  }
};

// Get single report by ID
export const getReportById = async (req, res) => {
  try {
    const reportId = req.params.id;
    
    // Get report details
    const reportQuery = `
      SELECT 
        r.*,
        u.full_name as created_by_name,
        u.email as created_by_email
      FROM reports r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.id = $1
    `;
    const reportResult = await pool.query(reportQuery, [reportId]);
    
    if (reportResult.rows.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const report = reportResult.rows[0];
    
    // Get related items
    const [salesItems, musicItems, techItems, challenges, priorities] = await Promise.all([
      pool.query('SELECT * FROM sales_items WHERE report_id = $1 ORDER BY id', [reportId]),
      pool.query('SELECT * FROM music_items WHERE report_id = $1 ORDER BY id', [reportId]),
      pool.query('SELECT * FROM tech_items WHERE report_id = $1 ORDER BY id', [reportId]),
      pool.query('SELECT * FROM challenges WHERE report_id = $1 ORDER BY id', [reportId]),
      pool.query('SELECT * FROM priorities WHERE report_id = $1 ORDER BY id', [reportId])
    ]);
    
    res.json({
      ...report,
      salesItems: salesItems.rows,
      musicItems: musicItems.rows,
      techItems: techItems.rows,
      challenges: challenges.rows,
      priorities: priorities.rows
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Error fetching report' });
  }
};

// Get report by week and year
export const getReportByWeekAndYear = async (req, res) => {
  try {
    const { weekNumber, year } = req.params;
    const userId = req.user.id;
    
    const reportQuery = `
      SELECT 
        r.*,
        u.full_name as created_by_name,
        u.email as created_by_email
      FROM reports r
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.week_number = $1 AND r.year = $2 AND r.created_by = $3
    `;
    const reportResult = await pool.query(reportQuery, [weekNumber, year, userId]);
    
    if (reportResult.rows.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const report = reportResult.rows[0];
    
    // Get related items
    const [salesItems, musicItems, techItems, challenges, priorities] = await Promise.all([
      pool.query('SELECT * FROM sales_items WHERE report_id = $1 ORDER BY id', [report.id]),
      pool.query('SELECT * FROM music_items WHERE report_id = $1 ORDER BY id', [report.id]),
      pool.query('SELECT * FROM tech_items WHERE report_id = $1 ORDER BY id', [report.id]),
      pool.query('SELECT * FROM challenges WHERE report_id = $1 ORDER BY id', [report.id]),
      pool.query('SELECT * FROM priorities WHERE report_id = $1 ORDER BY id', [report.id])
    ]);
    
    res.json({
      ...report,
      salesItems: salesItems.rows,
      musicItems: musicItems.rows,
      techItems: techItems.rows,
      challenges: challenges.rows,
      priorities: priorities.rows
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Error fetching report' });
  }
};

// Create new report
export const createReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { weekNumber, year, salesItems, musicItems, techItems, challenges, priorities } = req.body;
    const userId = req.user.id;
    
    // Check if report already exists for this week/year/user
    const existingReport = await client.query(
      'SELECT id FROM reports WHERE week_number = $1 AND year = $2 AND created_by = $3',
      [weekNumber, year, userId]
    );
    
    if (existingReport.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Report already exists for this week' });
    }
    
    // Create report
    const reportQuery = `
      INSERT INTO reports (week_number, year, created_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const reportResult = await client.query(reportQuery, [weekNumber, year, userId]);
    const reportId = reportResult.rows[0].id;
    
    // Insert sales items
    for (const item of salesItems) {
      await client.query(
        `INSERT INTO sales_items (report_id, status, description, zones, yearly_value, team_member)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [reportId, item.status, item.description, item.zones, item.yearlyValue, item.teamMember]
      );
    }
    
    // Insert music items
    for (const item of musicItems) {
      await client.query(
        `INSERT INTO music_items (report_id, description, team_member)
         VALUES ($1, $2, $3)`,
        [reportId, item.description, item.teamMember]
      );
    }
    
    // Insert tech items
    for (const item of techItems) {
      await client.query(
        `INSERT INTO tech_items (report_id, description, team_member)
         VALUES ($1, $2, $3)`,
        [reportId, item.description, item.teamMember]
      );
    }
    
    // Insert challenges
    for (const item of challenges) {
      await client.query(
        `INSERT INTO challenges (report_id, description)
         VALUES ($1, $2)`,
        [reportId, item.description]
      );
    }
    
    // Insert priorities
    for (const item of priorities) {
      await client.query(
        `INSERT INTO priorities (report_id, description)
         VALUES ($1, $2)`,
        [reportId, item.description]
      );
    }
    
    await client.query('COMMIT');
    
    // Fetch complete report
    const completeReport = await getCompleteReport(reportId);
    res.status(201).json(completeReport);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Error creating report' });
  } finally {
    client.release();
  }
};

// Update report
export const updateReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const reportId = req.params.id;
    const { weekNumber, year, salesItems, musicItems, techItems, challenges, priorities } = req.body;
    const userId = req.user.id;
    
    // Check if report exists and user owns it
    const reportCheck = await client.query(
      'SELECT id FROM reports WHERE id = $1 AND created_by = $2',
      [reportId, userId]
    );
    
    if (reportCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Report not found or unauthorized' });
    }
    
    // Update report
    await client.query(
      'UPDATE reports SET week_number = $1, year = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [weekNumber, year, reportId]
    );
    
    // Delete existing items
    await client.query('DELETE FROM sales_items WHERE report_id = $1', [reportId]);
    await client.query('DELETE FROM music_items WHERE report_id = $1', [reportId]);
    await client.query('DELETE FROM tech_items WHERE report_id = $1', [reportId]);
    await client.query('DELETE FROM challenges WHERE report_id = $1', [reportId]);
    await client.query('DELETE FROM priorities WHERE report_id = $1', [reportId]);
    
    // Insert new items
    for (const item of salesItems) {
      await client.query(
        `INSERT INTO sales_items (report_id, status, description, zones, yearly_value, team_member)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [reportId, item.status, item.description, item.zones, item.yearlyValue, item.teamMember]
      );
    }
    
    for (const item of musicItems) {
      await client.query(
        `INSERT INTO music_items (report_id, description, team_member)
         VALUES ($1, $2, $3)`,
        [reportId, item.description, item.teamMember]
      );
    }
    
    for (const item of techItems) {
      await client.query(
        `INSERT INTO tech_items (report_id, description, team_member)
         VALUES ($1, $2, $3)`,
        [reportId, item.description, item.teamMember]
      );
    }
    
    for (const item of challenges) {
      await client.query(
        `INSERT INTO challenges (report_id, description)
         VALUES ($1, $2)`,
        [reportId, item.description]
      );
    }
    
    for (const item of priorities) {
      await client.query(
        `INSERT INTO priorities (report_id, description)
         VALUES ($1, $2)`,
        [reportId, item.description]
      );
    }
    
    await client.query('COMMIT');
    
    // Fetch complete report
    const completeReport = await getCompleteReport(reportId);
    res.json(completeReport);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Error updating report' });
  } finally {
    client.release();
  }
};

// Delete report
export const deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.id;
    
    const result = await pool.query(
      'DELETE FROM reports WHERE id = $1 AND created_by = $2 RETURNING id',
      [reportId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Report not found or unauthorized' });
    }
    
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Error deleting report' });
  }
};

// Export report as PDF
export const exportReportPDF = async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await getCompleteReport(reportId);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=BMA_Report_Week${report.week_number}_${report.year}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(20).text('BMA Activity Report', { align: 'center' });
    doc.fontSize(14).text(`Week ${report.week_number}, ${report.year}`, { align: 'center' });
    doc.moveDown();
    
    // Sales section
    doc.fontSize(16).text('Sales', { underline: true });
    doc.moveDown(0.5);
    report.salesItems.forEach(item => {
      doc.fontSize(12).text(`• [${item.status}] ${item.description}`);
      if (item.zones) doc.text(`  Zones: ${item.zones}`);
      if (item.yearly_value) doc.text(`  Yearly Value: $${item.yearly_value}`);
      if (item.team_member) doc.text(`  Team Member: ${item.team_member}`);
      doc.moveDown(0.5);
    });
    doc.moveDown();
    
    // Music section
    doc.fontSize(16).text('Music', { underline: true });
    doc.moveDown(0.5);
    report.musicItems.forEach(item => {
      doc.fontSize(12).text(`• ${item.description}`);
      if (item.team_member) doc.text(`  Team Member: ${item.team_member}`);
      doc.moveDown(0.5);
    });
    doc.moveDown();
    
    // Tech section
    doc.fontSize(16).text('Tech', { underline: true });
    doc.moveDown(0.5);
    report.techItems.forEach(item => {
      doc.fontSize(12).text(`• ${item.description}`);
      if (item.team_member) doc.text(`  Team Member: ${item.team_member}`);
      doc.moveDown(0.5);
    });
    doc.moveDown();
    
    // Challenges section
    doc.fontSize(16).text('Challenges', { underline: true });
    doc.moveDown(0.5);
    report.challenges.forEach(item => {
      doc.fontSize(12).text(`• ${item.description}`);
      doc.moveDown(0.5);
    });
    doc.moveDown();
    
    // Priorities section
    doc.fontSize(16).text('Priorities', { underline: true });
    doc.moveDown(0.5);
    report.priorities.forEach(item => {
      doc.fontSize(12).text(`• ${item.description}`);
      doc.moveDown(0.5);
    });
    
    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.text(`Created by: ${report.created_by_name}`, { align: 'center' });
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ message: 'Error exporting report' });
  }
};

// Export report as CSV
export const exportReportCSV = async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await getCompleteReport(reportId);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Prepare data for CSV
    const csvData = [];
    
    // Add sales items
    report.salesItems.forEach(item => {
      csvData.push({
        Category: 'Sales',
        Status: item.status,
        Description: item.description,
        Zones: item.zones || '',
        'Yearly Value': item.yearly_value || '',
        'Team Member': item.team_member || ''
      });
    });
    
    // Add music items
    report.musicItems.forEach(item => {
      csvData.push({
        Category: 'Music',
        Status: '',
        Description: item.description,
        Zones: '',
        'Yearly Value': '',
        'Team Member': item.team_member || ''
      });
    });
    
    // Add tech items
    report.techItems.forEach(item => {
      csvData.push({
        Category: 'Tech',
        Status: '',
        Description: item.description,
        Zones: '',
        'Yearly Value': '',
        'Team Member': item.team_member || ''
      });
    });
    
    // Add challenges
    report.challenges.forEach(item => {
      csvData.push({
        Category: 'Challenge',
        Status: '',
        Description: item.description,
        Zones: '',
        'Yearly Value': '',
        'Team Member': ''
      });
    });
    
    // Add priorities
    report.priorities.forEach(item => {
      csvData.push({
        Category: 'Priority',
        Status: '',
        Description: item.description,
        Zones: '',
        'Yearly Value': '',
        'Team Member': ''
      });
    });
    
    // Convert to CSV
    const parser = new Parser();
    const csv = parser.parse(csvData);
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=BMA_Report_Week${report.week_number}_${report.year}.csv`);
    
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ message: 'Error exporting report' });
  }
};

// Get report statistics
export const getReportStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT r.id) as total_reports,
        COUNT(DISTINCT s.id) as total_sales,
        COUNT(DISTINCT m.id) as total_music,
        COUNT(DISTINCT t.id) as total_tech,
        COALESCE(SUM(s.yearly_value), 0) as total_yearly_value,
        COUNT(DISTINCT CASE WHEN s.status = 'New' THEN s.id END) as new_sales,
        COUNT(DISTINCT CASE WHEN s.status = 'Existing' THEN s.id END) as existing_sales,
        COUNT(DISTINCT CASE WHEN s.status = 'Renewal' THEN s.id END) as renewal_sales
      FROM reports r
      LEFT JOIN sales_items s ON r.id = s.report_id
      LEFT JOIN music_items m ON r.id = m.report_id
      LEFT JOIN tech_items t ON r.id = t.report_id
      WHERE r.created_by = $1
    `;
    
    const statsResult = await pool.query(statsQuery, [userId]);
    res.json(statsResult.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
};

// Helper function to get complete report
async function getCompleteReport(reportId) {
  const reportQuery = `
    SELECT 
      r.*,
      u.full_name as created_by_name,
      u.email as created_by_email
    FROM reports r
    LEFT JOIN users u ON r.created_by = u.id
    WHERE r.id = $1
  `;
  const reportResult = await pool.query(reportQuery, [reportId]);
  
  if (reportResult.rows.length === 0) {
    return null;
  }
  
  const report = reportResult.rows[0];
  
  const [salesItems, musicItems, techItems, challenges, priorities] = await Promise.all([
    pool.query('SELECT * FROM sales_items WHERE report_id = $1 ORDER BY id', [reportId]),
    pool.query('SELECT * FROM music_items WHERE report_id = $1 ORDER BY id', [reportId]),
    pool.query('SELECT * FROM tech_items WHERE report_id = $1 ORDER BY id', [reportId]),
    pool.query('SELECT * FROM challenges WHERE report_id = $1 ORDER BY id', [reportId]),
    pool.query('SELECT * FROM priorities WHERE report_id = $1 ORDER BY id', [reportId])
  ]);
  
  return {
    ...report,
    salesItems: salesItems.rows,
    musicItems: musicItems.rows,
    techItems: techItems.rows,
    challenges: challenges.rows,
    priorities: priorities.rows
  };
}