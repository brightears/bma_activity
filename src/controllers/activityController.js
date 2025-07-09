import * as activityModel from '../models/activityModel.js';

// Get all activities
export const getAllActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, type, startDate, endDate } = req.query;
    
    const activities = await activityModel.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      type,
      startDate,
      endDate
    });
    
    res.json({
      success: true,
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: activities.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get activity by ID
export const getActivityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const activity = await activityModel.findById(id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// Create new activity
export const createActivity = async (req, res, next) => {
  try {
    const activityData = {
      ...req.body,
      created_by: req.user.id // Assuming user is attached by auth middleware
    };
    
    const newActivity = await activityModel.create(activityData);
    
    res.status(201).json({
      success: true,
      data: newActivity,
      message: 'Activity created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update activity
export const updateActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedActivity = await activityModel.update(id, req.body);
    
    if (!updatedActivity) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedActivity,
      message: 'Activity updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete activity
export const deleteActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await activityModel.remove(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Activity not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get activity participants
export const getActivityParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const participants = await activityModel.getParticipants(id);
    
    res.json({
      success: true,
      data: participants
    });
  } catch (error) {
    next(error);
  }
};

// Add participant to activity
export const addParticipant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { participantId, role, attendanceStatus } = req.body;
    
    const result = await activityModel.addParticipant(id, {
      participantId,
      role,
      attendanceStatus
    });
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Participant added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Remove participant from activity
export const removeParticipant = async (req, res, next) => {
  try {
    const { id, participantId } = req.params;
    const removed = await activityModel.removeParticipant(id, participantId);
    
    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found in this activity'
      });
    }
    
    res.json({
      success: true,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get public activities (no auth required)
export const getPublicActivities = async (req, res, next) => {
  try {
    const activities = await activityModel.findPublic();
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// Get activity summary report
export const getActivitySummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await activityModel.getSummary({ startDate, endDate });
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

// Get activities by type
export const getActivitiesByType = async (req, res, next) => {
  try {
    const report = await activityModel.getByType();
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// Get activities by date range
export const getActivitiesByDateRange = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }
    
    const report = await activityModel.getByDateRange({
      startDate,
      endDate,
      groupBy
    });
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};