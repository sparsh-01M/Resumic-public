import { Request, Response } from 'express';
import { Waitlist } from '../models/Waitlist.js';

export const joinWaitlist = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    // Prevent duplicate emails
    const existing = await Waitlist.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You are already on the waitlist!' });
    }
    await Waitlist.create({ name, email });
    res.json({ success: true, message: 'Successfully joined the waitlist!' });
  } catch (error) {
    console.error('Waitlist join error:', error);
    res.status(500).json({ success: false, message: 'Failed to join waitlist' });
  }
};

export const checkWaitlist = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ joined: false, message: 'Email is required' });
    }
    const existing = await Waitlist.findOne({ email });
    res.json({ joined: !!existing });
  } catch (error) {
    console.error('Waitlist check error:', error);
    res.status(500).json({ joined: false, message: 'Failed to check waitlist' });
  }
}; 