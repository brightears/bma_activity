import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware
const validateReport = [
  body('weekNumber').isInt({ min: 1, max: 53 }).withMessage('Week number must be between 1 and 53'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Invalid year'),
  body('salesItems').isArray().withMessage('Sales items must be an array'),
  body('salesItems.*.status').isIn(['New', 'Existing', 'Renewal']).withMessage('Invalid sales status'),
  body('salesItems.*.description').notEmpty().withMessage('Sales description is required'),
  body('musicItems').isArray().withMessage('Music items must be an array'),
  body('musicItems.*.description').notEmpty().withMessage('Music description is required'),
  body('techItems').isArray().withMessage('Tech items must be an array'),
  body('techItems.*.description').notEmpty().withMessage('Tech description is required'),
  body('challenges').isArray().withMessage('Challenges must be an array'),
  body('challenges.*.description').notEmpty().withMessage('Challenge description is required'),
  body('priorities').isArray().withMessage('Priorities must be an array'),
  body('priorities.*.description').notEmpty().withMessage('Priority description is required')
];

// Get all reports (with pagination)
router.get('/', reportController.getAllReports);

// Get reports for current user
router.get('/my-reports', reportController.getMyReports);

// Get single report by ID
router.get('/:id', reportController.getReportById);

// Get report by week and year
router.get('/week/:weekNumber/year/:year', reportController.getReportByWeekAndYear);

// Create new report
router.post('/', validateReport, reportController.createReport);

// Update report
router.put('/:id', validateReport, reportController.updateReport);

// Delete report
router.delete('/:id', reportController.deleteReport);

// Export report as PDF
router.get('/:id/export/pdf', reportController.exportReportPDF);

// Export report as CSV
router.get('/:id/export/csv', reportController.exportReportCSV);

// Get report statistics
router.get('/stats/overview', reportController.getReportStats);

export default router;