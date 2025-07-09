import express from 'express';
import * as activityController from '../controllers/activityController.js';
import { validateActivity } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes (if any)
router.get('/public', activityController.getPublicActivities);

// Protected routes (require authentication)
router.use(authenticate); // Apply authentication to all routes below

// Activity CRUD operations
router.get('/', activityController.getAllActivities);
router.get('/:id', activityController.getActivityById);
router.post('/', validateActivity, activityController.createActivity);
router.put('/:id', validateActivity, activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);

// Additional activity-related endpoints
router.get('/:id/participants', activityController.getActivityParticipants);
router.post('/:id/participants', activityController.addParticipant);
router.delete('/:id/participants/:participantId', activityController.removeParticipant);

// Reports and statistics
router.get('/reports/summary', activityController.getActivitySummary);
router.get('/reports/by-type', activityController.getActivitiesByType);
router.get('/reports/by-date-range', activityController.getActivitiesByDateRange);

export default router;