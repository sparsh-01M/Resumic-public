import express from 'express';
import passport from 'passport';
import { auth } from '../middleware/auth.js';
import { linkedinAuth, linkedinCallback, fetchLinkedInProfile, disconnectLinkedInProfile } from '../controllers/linkedin.js';

const router = express.Router();

// Start LinkedIn OAuth
router.get('/auth/linkedin', linkedinAuth);
// LinkedIn OAuth callback
router.get('/auth/linkedin/callback', linkedinCallback);
// Fetch and store LinkedIn profile data (after OAuth)
router.get('/profile', auth, fetchLinkedInProfile);
// Disconnect LinkedIn profile
router.post('/disconnect', auth, disconnectLinkedInProfile);

export default router; 