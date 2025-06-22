import { Request, Response } from 'express';
import { User } from '../models/User.js';
import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import axios from 'axios';
import { LinkedInData } from '../models/LinkedInData.js';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '';
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || '';
const LINKEDIN_CALLBACK_URL = process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:5001/api/linkedin/auth/linkedin/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Configure passport strategy
passport.use(new LinkedInStrategy({
  clientID: LINKEDIN_CLIENT_ID,
  clientSecret: LINKEDIN_CLIENT_SECRET,
  callbackURL: LINKEDIN_CALLBACK_URL,
  scope: ['openid', 'profile', 'email']
}, (accessToken: string, refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
  // We'll handle user data in the callback controller
  done(null, { profile, accessToken });
}));

export const linkedinAuth = passport.authenticate('linkedin');

export const linkedinCallback = (req: Request, res: Response, next: any) => {
  passport.authenticate('linkedin', { session: false }, async (err: any, user: any, info: any) => {
    console.log('LinkedIn callback:', { err, user, info });
    if (err || !user) {
      return res.redirect(`${FRONTEND_URL}/?error=LinkedIn authentication failed`);
    }
    // @ts-ignore
    req.session = req.session || {};
    // @ts-ignore
    req.session.linkedinAccessToken = user.accessToken;
    try {
      // Fetch name, email, and picture from /v2/userinfo
      const userInfoRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
      const { name, email, picture } = userInfoRes.data;
      // Save to user model (update current user by email or id)
      await User.findOneAndUpdate(
        { email },
        {
          $set: {
            name: name || '',
            email: email || '',
            linkedInProfile: picture || '',
            linkedInConnected: true,
            linkedInLastUpdated: new Date()
          }
        },
        { new: true, upsert: true }
      );
      res.redirect(`${FRONTEND_URL}/dashboard?linkedin=success`);
    } catch (fetchErr) {
      console.error('Failed to fetch LinkedIn userinfo:', fetchErr);
      return res.redirect(`${FRONTEND_URL}/?error=LinkedIn userinfo fetch failed`);
}
  })(req, res, next);
};

export const fetchLinkedInProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const accessToken = req.session?.linkedinAccessToken;
    if (!accessToken) {
      return res.status(401).json({ error: 'No LinkedIn access token found. Please authenticate.' });
    }
    // Fetch profile data from LinkedIn API
    const [profileRes, emailRes] = await Promise.all([
      axios.get('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    ]);
    const profile = profileRes.data;
    const email = emailRes.data?.elements?.[0]?.['handle~']?.emailAddress || '';
    // Save to user model
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Save to LinkedInData collection as well
    try {
          await LinkedInData.findOneAndUpdate(
            { userId },
            {
          userId,
          profileUrl: profile.vanityName ? `https://linkedin.com/in/${profile.vanityName}` : '',
          data: {
            id: profile.id,
            firstName: profile.localizedFirstName,
            lastName: profile.localizedLastName,
            headline: profile.headline || '',
            email,
          },
          lastUpdated: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('Error saving LinkedInData:', err);
    }
    const updatedUser = await User.findByIdAndUpdate(userId, {
      $set: {
        linkedInProfile: profile.vanityName ? `https://linkedin.com/in/${profile.vanityName}` : '',
        linkedInData: {
          id: profile.id,
          firstName: profile.localizedFirstName,
          lastName: profile.localizedLastName,
          headline: profile.headline || '',
          email,
        },
        linkedInConnected: true,
        linkedInLastUpdated: new Date()
      }
    }, { new: true });
    res.json({ success: true, data: updatedUser?.linkedInData });
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    res.status(500).json({ error: 'Failed to fetch LinkedIn profile' });
  }
};

export const disconnectLinkedInProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log('LinkedIn disconnect requested for user:', userId);
    if (!userId) {
      console.warn('No userId found in request');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    const session = await User.startSession();
    try {
      await session.withTransaction(async () => {
        // First check if user has transformedResume
        const existingUser = await User.findById(userId).select('transformedResume');
        if (!existingUser) {
          console.warn('User not found for LinkedIn disconnect:', userId);
          throw new Error('User not found');
        }
        // Update User model
        const user = await User.findByIdAndUpdate(
          userId,
          {
            $set: {
              linkedInProfile: undefined,
              linkedInData: undefined,
              linkedInConnected: false,
              linkedInLastUpdated: undefined,
              // Clear transformedResume.linkedin if it exists
              ...(existingUser.transformedResume && {
                'transformedResume.linkedin': ''
              })
            }
          },
          { new: true, session }
        );
        if (!user) {
          console.warn('User not found after update for LinkedIn disconnect:', userId);
          throw new Error('User not found after update');
        }
        // Delete LinkedInData document
        try {
          const deleted = await LinkedInData.findOneAndDelete(
          { userId },
          { session }
        );
          if (!deleted) {
            console.warn('No LinkedInData found to delete for user:', userId);
          }
        } catch (err) {
          console.error('Error deleting LinkedInData:', err);
        }
        console.log('\n=== LinkedIn Profile Disconnected ===');
        console.log(`User ID: ${userId}`);
        console.log('✅ Successfully removed LinkedIn data from both models');
      });
    } finally {
      await session.endSession();
    }
    res.json({
      success: true,
      message: 'LinkedIn profile disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting LinkedIn profile:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to disconnect LinkedIn profile'
    });
  }
}; 