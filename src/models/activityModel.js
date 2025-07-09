import { query, transaction } from '../config/database.js';

// Find all activities with filters
export const findAll = async ({ page = 1, limit = 10, status, type, startDate, endDate }) => {
  let queryText = `
    SELECT 
      a.*,
      at.name as activity_type_name,
      u.full_name as created_by_name,
      COUNT(ap.participant_id) as participant_count
    FROM activities a
    LEFT JOIN activity_types at ON a.activity_type_id = at.id
    LEFT JOIN users u ON a.created_by = u.id
    LEFT JOIN activity_participants ap ON a.id = ap.activity_id
    WHERE 1=1
  `;
  
  const queryParams = [];
  let paramCount = 0;
  
  if (status) {
    queryParams.push(status);
    queryText += ` AND a.status = $${++paramCount}`;
  }
  
  if (type) {
    queryParams.push(type);
    queryText += ` AND a.activity_type_id = $${++paramCount}`;
  }
  
  if (startDate) {
    queryParams.push(startDate);
    queryText += ` AND a.start_date >= $${++paramCount}`;
  }
  
  if (endDate) {
    queryParams.push(endDate);
    queryText += ` AND a.end_date <= $${++paramCount}`;
  }
  
  queryText += `
    GROUP BY a.id, at.name, u.full_name
    ORDER BY a.start_date DESC
    LIMIT $${++paramCount} OFFSET $${++paramCount}
  `;
  
  queryParams.push(limit, (page - 1) * limit);
  
  const result = await query(queryText, queryParams);
  return result.rows;
};

// Find activity by ID
export const findById = async (id) => {
  const queryText = `
    SELECT 
      a.*,
      at.name as activity_type_name,
      at.color as activity_type_color,
      u.full_name as created_by_name
    FROM activities a
    LEFT JOIN activity_types at ON a.activity_type_id = at.id
    LEFT JOIN users u ON a.created_by = u.id
    WHERE a.id = $1
  `;
  
  const result = await query(queryText, [id]);
  return result.rows[0];
};

// Create new activity
export const create = async (activityData) => {
  const {
    title,
    description,
    activity_type_id,
    location,
    start_date,
    end_date,
    start_time,
    end_time,
    duration_hours,
    status = 'planned',
    notes,
    created_by
  } = activityData;
  
  const queryText = `
    INSERT INTO activities (
      title, description, activity_type_id, location,
      start_date, end_date, start_time, end_time,
      duration_hours, status, notes, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `;
  
  const values = [
    title, description, activity_type_id, location,
    start_date, end_date, start_time, end_time,
    duration_hours, status, notes, created_by
  ];
  
  const result = await query(queryText, values);
  return result.rows[0];
};

// Update activity
export const update = async (id, activityData) => {
  const fields = [];
  const values = [];
  let paramCount = 1;
  
  // Build dynamic update query
  Object.entries(activityData).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'created_by') {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });
  
  if (fields.length === 0) {
    return null;
  }
  
  values.push(id);
  
  const queryText = `
    UPDATE activities 
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await query(queryText, values);
  return result.rows[0];
};

// Delete activity
export const remove = async (id) => {
  const queryText = 'DELETE FROM activities WHERE id = $1 RETURNING id';
  const result = await query(queryText, [id]);
  return result.rows[0];
};

// Get activity participants
export const getParticipants = async (activityId) => {
  const queryText = `
    SELECT 
      p.*,
      ap.role,
      ap.attendance_status,
      ap.notes as participation_notes
    FROM participants p
    JOIN activity_participants ap ON p.id = ap.participant_id
    WHERE ap.activity_id = $1
    ORDER BY p.last_name, p.first_name
  `;
  
  const result = await query(queryText, [activityId]);
  return result.rows;
};

// Add participant to activity
export const addParticipant = async (activityId, participantData) => {
  const { participantId, role, attendanceStatus = 'confirmed' } = participantData;
  
  const queryText = `
    INSERT INTO activity_participants (activity_id, participant_id, role, attendance_status)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (activity_id, participant_id) 
    DO UPDATE SET role = $3, attendance_status = $4
    RETURNING *
  `;
  
  const values = [activityId, participantId, role, attendanceStatus];
  const result = await query(queryText, values);
  return result.rows[0];
};

// Remove participant from activity
export const removeParticipant = async (activityId, participantId) => {
  const queryText = `
    DELETE FROM activity_participants 
    WHERE activity_id = $1 AND participant_id = $2
    RETURNING id
  `;
  
  const result = await query(queryText, [activityId, participantId]);
  return result.rows[0];
};

// Get public activities
export const findPublic = async () => {
  const queryText = `
    SELECT 
      a.id,
      a.title,
      a.description,
      a.start_date,
      a.location,
      at.name as activity_type
    FROM activities a
    LEFT JOIN activity_types at ON a.activity_type_id = at.id
    WHERE a.status = 'completed' OR a.status = 'ongoing'
    ORDER BY a.start_date DESC
    LIMIT 20
  `;
  
  const result = await query(queryText);
  return result.rows;
};

// Get activity summary
export const getSummary = async ({ startDate, endDate }) => {
  let queryText = `
    SELECT 
      COUNT(*) as total_activities,
      COUNT(DISTINCT created_by) as total_organizers,
      COUNT(DISTINCT ap.participant_id) as total_unique_participants,
      SUM(duration_hours) as total_hours
    FROM activities a
    LEFT JOIN activity_participants ap ON a.id = ap.activity_id
    WHERE 1=1
  `;
  
  const queryParams = [];
  let paramCount = 0;
  
  if (startDate) {
    queryParams.push(startDate);
    queryText += ` AND a.start_date >= $${++paramCount}`;
  }
  
  if (endDate) {
    queryParams.push(endDate);
    queryText += ` AND a.end_date <= $${++paramCount}`;
  }
  
  const result = await query(queryText, queryParams);
  return result.rows[0];
};

// Get activities grouped by type
export const getByType = async () => {
  const queryText = `
    SELECT 
      at.name as activity_type,
      at.color,
      COUNT(a.id) as count,
      SUM(a.duration_hours) as total_hours
    FROM activity_types at
    LEFT JOIN activities a ON at.id = a.activity_type_id
    GROUP BY at.id, at.name, at.color
    ORDER BY count DESC
  `;
  
  const result = await query(queryText);
  return result.rows;
};

// Get activities by date range with grouping
export const getByDateRange = async ({ startDate, endDate, groupBy = 'month' }) => {
  let dateFormat;
  
  switch (groupBy) {
    case 'day':
      dateFormat = 'YYYY-MM-DD';
      break;
    case 'week':
      dateFormat = 'IYYY-IW';
      break;
    case 'month':
      dateFormat = 'YYYY-MM';
      break;
    case 'year':
      dateFormat = 'YYYY';
      break;
    default:
      dateFormat = 'YYYY-MM';
  }
  
  const queryText = `
    SELECT 
      TO_CHAR(start_date, $1) as period,
      COUNT(*) as activity_count,
      COUNT(DISTINCT created_by) as unique_organizers,
      SUM(duration_hours) as total_hours
    FROM activities
    WHERE start_date >= $2 AND start_date <= $3
    GROUP BY period
    ORDER BY period
  `;
  
  const result = await query(queryText, [dateFormat, startDate, endDate]);
  return result.rows;
};