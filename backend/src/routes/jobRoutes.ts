import express from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobCategories,
  getJobStats,
  incrementApplyClickCount,
} from '../controllers/jobController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (for viewing jobs)
router.get('/', getAllJobs);
router.get('/categories', getJobCategories);
router.get('/stats', getJobStats);
router.get('/:id', getJobById);

// Apply click count route (public - no auth required)
router.post('/:jobId/apply-click', incrementApplyClickCount);

// Protected routes
router.post('/', auth, createJob);
router.put('/:id', auth, updateJob);
router.delete('/:id', auth, deleteJob);

export default router; 