import express from 'express';
import { auth } from '../middleware/auth.js';
import { getUserProfile } from '../controllers/users.js';

const router = express.Router();

// Get user profile
router.get('/profile', auth, getUserProfile);

export default router; 