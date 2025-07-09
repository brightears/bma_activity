// Validation middleware for request data

export const validateActivity = (req, res, next) => {
  const { title, start_date, activity_type_id } = req.body;
  
  const errors = [];
  
  // Required field validation
  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!start_date) {
    errors.push('Start date is required');
  }
  
  if (!activity_type_id) {
    errors.push('Activity type is required');
  }
  
  // Date validation
  if (start_date && req.body.end_date) {
    const startDate = new Date(start_date);
    const endDate = new Date(req.body.end_date);
    
    if (endDate < startDate) {
      errors.push('End date must be after start date');
    }
  }
  
  // Time validation
  if (req.body.start_time && req.body.end_time) {
    const startTime = new Date(`2000-01-01 ${req.body.start_time}`);
    const endTime = new Date(`2000-01-01 ${req.body.end_time}`);
    
    if (endTime <= startTime && !req.body.end_date) {
      errors.push('End time must be after start time');
    }
  }
  
  // Status validation
  const validStatuses = ['planned', 'ongoing', 'completed', 'cancelled'];
  if (req.body.status && !validStatuses.includes(req.body.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  
  // If there are validation errors, return 400
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  next();
};

export const validateParticipant = (req, res, next) => {
  const { first_name, last_name } = req.body;
  
  const errors = [];
  
  if (!first_name || first_name.trim().length === 0) {
    errors.push('First name is required');
  }
  
  if (!last_name || last_name.trim().length === 0) {
    errors.push('Last name is required');
  }
  
  // Email validation if provided
  if (req.body.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      errors.push('Invalid email format');
    }
  }
  
  // Phone validation if provided
  if (req.body.phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(req.body.phone)) {
      errors.push('Invalid phone format');
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }
  
  next();
};

// Generic validation for pagination
export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      error: 'Page must be a positive integer'
    });
  }
  
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be between 1 and 100'
    });
  }
  
  next();
};

// Sanitize input to prevent XSS
export const sanitizeInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };
  
  const sanitizeObject = (obj) => {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };
  
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  next();
};