import '../config/firebase';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import admin from 'firebase-admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const testAuth = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Authentication successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Auth test error:', error);
    res.status(500).json({ message: 'Error testing authentication' });
  }
};

export const firebaseLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'No ID token provided' });
    }
    // Verify the ID token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, name, email } = decodedToken;
    if (!email) {
      return res.status(400).json({ message: 'No email in Firebase token' });
    }
    // Find or create user
    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      // If not found by firebaseUid, try by email (migration case)
      user = await User.findOne({ email });
      if (user) {
        user.firebaseUid = uid;
        user.provider = 'firebase';
        await user.save();
      } else {
        user = new User({
          name: name || email.split('@')[0],
          email,
          firebaseUid: uid,
          provider: 'firebase',
          password: Math.random().toString(36).slice(-8), // random password, not used
        });
        await user.save();
      }
    }
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        githubConnected: user.githubConnected,
        linkedInProfile: user.linkedInProfile,
        linkedInLastUpdated: user.linkedInLastUpdated,
        transformedResume: user.transformedResume,
      },
    });
  } catch (error) {
    console.error('Firebase login error:', error);
    res.status(401).json({ message: 'Invalid Firebase ID token' });
  }
}; 