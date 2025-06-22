import express from 'express';
import { joinWaitlist, checkWaitlist } from '../controllers/waitlist.js';

const router = express.Router();

router.post('/join', joinWaitlist);
router.get('/check', checkWaitlist);

export default router; 