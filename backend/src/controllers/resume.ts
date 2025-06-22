import { Request, Response } from 'express';
import { User, IUser, ParsedResumeData } from '../models/User.js';
import { Resume, IResume } from '../models/Resume.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.js';
// import { TemplateResumeData } from '../types/resume.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
// import { transformResumeData } from '../utils/resumeDataTransformer.js';

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
  user?: IUser & { _id: string };
}

interface Education {
  startDate?: string;
  endDate?: string;
  institution?: string;
  degree?: string;
  gpa?: string;
  coursework?: string[];
}

interface Experience {
  startDate?: string;
  endDate?: string;
  title?: string;
  company?: string;
  location?: string;
  highlights?: string[];
}

interface Project {
  name?: string;
  link?: string;
  date?: string;
  description?: string[];
  technologies?: string;
}

interface Skill {
  category?: string;
  items?: string;
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Calculate ATS Score based on resume content
const calculateATSScore = async (file: Express.Multer.File): Promise<number> => {
  try {
    // For now, return a random score between 70-95
    // In a real implementation, you would analyze the resume content
    // using AI to check for keywords, formatting, structure, etc.
    return Math.floor(Math.random() * 26) + 70; // 70-95
  } catch (error) {
    console.error('Error calculating ATS score:', error);
    return 75; // Default score
  }
};

// Clean up old resumes (keep only last 10)
const cleanupOldResumes = async (userId: string) => {
  try {
    const userResumes = await Resume.find({ userId }).sort({ uploadedAt: -1 });
    
    if (userResumes.length > 10) {
      const resumesToDelete = userResumes.slice(10);
      
      for (const resume of resumesToDelete) {
        // Delete from Cloudinary
        await deleteFromCloudinary(resume.cloudinaryPublicId);
        // Delete from database
        await Resume.findByIdAndDelete(resume._id);
      }
      
      console.log(`Cleaned up ${resumesToDelete.length} old resumes for user ${userId}`);
    }
  } catch (error) {
    console.error('Error cleaning up old resumes:', error);
  }
};

export const uploadResume = async (req: RequestWithFile, res: Response) => {
  try {
    console.log('Starting resume upload...');
    console.log('Request file:', req.file);
    console.log('Request user:', req.user);

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.user) {
      console.log('No user in request');
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const file = req.file;
    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      buffer: file.buffer ? 'Buffer present' : 'No buffer'
    });

    // Upload to Cloudinary
    console.log('Attempting Cloudinary upload...');
    const cloudinaryResult = await uploadToCloudinary(file);
    console.log('Cloudinary upload successful, URL:', cloudinaryResult);

    // Extract public ID from Cloudinary URL
    const urlParts = cloudinaryResult.split('/');
    const publicId = urlParts[urlParts.length - 1].split('.')[0];
    const fullPublicId = `resumic/resumes/${publicId}`;

    // Calculate ATS Score
    const atsScore = await calculateATSScore(file);

    // Create resume name (remove file extension)
    const resumeName = file.originalname.replace(/\.[^/.]+$/, "");

    // Save resume to database
    const resume = new Resume({
      userId: req.user.id,
      name: resumeName,
      originalName: file.originalname,
      cloudinaryUrl: cloudinaryResult,
      cloudinaryPublicId: fullPublicId,
      atsScore,
      fileSize: file.size,
      fileType: file.mimetype
    });

    await resume.save();

    // Clean up old resumes
    await cleanupOldResumes(req.user.id.toString());

    console.log('Resume saved successfully');
    
    // Return response in the format expected by the frontend
    res.json({
      id: (resume as IResume & { _id: string })._id.toString(),
      title: resume.name,
      url: resume.cloudinaryUrl,
      createdAt: resume.uploadedAt.toISOString(),
      atsScore: resume.atsScore,
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    res.status(500).json({ 
      error: 'Failed to upload resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const saveParsedResume = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const parsedData: ParsedResumeData = req.body;
    console.log('Saving parsed resume data for user:', userId);
    console.log('Data summary:', {
      name: parsedData.name,
      email: parsedData.email,
      experienceCount: parsedData.experience?.length || 0,
      educationCount: parsedData.education?.length || 0,
      projectsCount: parsedData.projects?.length || 0,
      skillsCount: parsedData.skills?.length || 0
    });

    // Clean up the data before saving
    const cleanedData = {
      name: parsedData.name,
      email: parsedData.email,
      phone: parsedData.phone || undefined,
      location: parsedData.location || undefined,
      summary: parsedData.summary || undefined,
      experience: parsedData.experience?.map(exp => ({
        company: exp.company,
        position: exp.position,
        duration: exp.duration,
        description: exp.description || undefined
      })) || [],
      education: parsedData.education?.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field || undefined,
        graduationYear: edu.graduationYear,
        startYear: edu.startYear || undefined
      })) || [],
      certifications: parsedData.certifications?.map(cert => ({
        name: cert.name,
        issuer: cert.issuer,
        date: cert.date || undefined,
        url: cert.url || undefined
      })) || [],
      achievements: parsedData.achievements?.map(achievement => ({
        title: achievement.title,
        type: achievement.type,
        date: achievement.date || undefined,
        description: achievement.description,
        position: achievement.position || undefined,
        organization: achievement.organization || undefined,
        url: achievement.url || undefined
      })) || [],
      projects: parsedData.projects?.map(project => ({
        name: project.name,
        description: project.description,
        technologies: project.technologies || [],
        duration: project.duration || undefined,
        url: project.url || undefined
      })) || [],
      skills: parsedData.skills || []
    };

    // Update user with parsed resume data, but don't update email
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: cleanedData.name,
          skills: cleanedData.skills,
          parsedResume: {
            ...cleanedData,
            parsedAt: new Date()
          }
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      console.log('User not found after update');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Successfully saved parsed resume data to MongoDB');
    console.log('Updated user document:', {
      id: user._id,
      name: user.name,
      email: user.email,
      skillsCount: user.skills.length,
      parsedAt: user.parsedResume?.parsedAt
    });

    res.json({
      success: true,
      message: 'Resume data saved successfully',
      data: {
        name: user.name,
        email: user.email,
        skills: user.skills,
        parsedAt: user.parsedResume?.parsedAt
      }
    });
  } catch (error) {
    console.error('Error saving parsed resume data:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to save resume data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const saveTemplate = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const { template } = req.body;

    // Validate template data
    if (!template?.id || !template?.name || !template?.filePath) {
      return res.status(400).json({
        success: false,
        message: 'Invalid template data'
      });
    }

    // Get current user data to access parsedResume, GitHub, LinkedIn
    const currentUser = await User.findById(userId).select('githubProfile linkedInProfile parsedResume');
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    const parsed = currentUser.parsedResume;
    if (!parsed) {
      return res.status(400).json({
        success: false,
        message: 'No parsed resume data found. Please upload and parse your resume first.'
      });
    }

    // Use the backend transformer to normalize all data
    const transformedResume = transformResumeData(currentUser);

    // Update user with template selection and transformed data
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          selectedTemplate: {
            id: template.id,
            name: template.name,
            filePath: template.filePath,
            selectedAt: new Date()
          },
          transformedResume: transformedResume
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Successfully saved template selection and transformed data');
    console.log('Updated user document:', {
      id: user._id,
      name: user.name,
      email: user.email,
      templateId: user.selectedTemplate?.id,
      templateName: user.selectedTemplate?.name,
      updatedAt: user.transformedResume?.updatedAt,
      linkedinUrl: user.transformedResume?.linkedin,
      githubUrl: user.transformedResume?.github
    });

    res.json({
      success: true,
      message: 'Template selection saved successfully',
      data: {
        templateId: user.selectedTemplate?.id,
        name: user.selectedTemplate?.name,
        filePath: user.selectedTemplate?.filePath
      }
    });
  } catch (error) {
    console.error('Error saving template selection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save template selection'
    });
  }
};

// Get user's resume history (last 10 resumes)
export const getResumeHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const resumes = await Resume.find({ userId: req.user.id })
      .sort({ uploadedAt: -1 })
      .limit(10)
      .select('-cloudinaryPublicId');

    res.json({
      success: true,
      data: resumes.map(resume => ({
        id: resume._id,
        name: resume.name,
        originalName: resume.originalName,
        url: resume.cloudinaryUrl,
        atsScore: resume.atsScore,
        uploadedAt: resume.uploadedAt.toISOString(),
        lastAccessed: resume.lastAccessed?.toISOString(),
        fileSize: resume.fileSize,
        fileType: resume.fileType
      }))
    });
  } catch (error) {
    console.error('Error fetching resume history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch resume history',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete a resume
export const deleteResume = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { resumeId } = req.params;

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(resume.cloudinaryPublicId);
    
    // Delete from database
    await Resume.findByIdAndDelete(resumeId);

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ 
      error: 'Failed to delete resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Download a resume (update lastAccessed)
export const downloadResume = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { resumeId } = req.params;

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Update last accessed time
    await Resume.findByIdAndUpdate(resumeId, { lastAccessed: new Date() });

    res.json({
      success: true,
      data: {
        id: resume._id,
        name: resume.name,
        originalName: resume.originalName,
        url: resume.cloudinaryUrl,
        atsScore: resume.atsScore,
        uploadedAt: resume.uploadedAt.toISOString(),
        fileSize: resume.fileSize,
        fileType: resume.fileType
      }
    });
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ 
      error: 'Failed to download resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update transformedResume with GitHub and LinkedIn URLs
export const updateTransformedResumeUrls = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get current user data
    const user = await User.findById(userId).select('transformedResume githubProfile linkedInProfile');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Only update if transformedResume exists
    if (!user.transformedResume) {
      return res.status(400).json({
        success: false,
        message: 'No transformed resume found. Please create a resume first.'
      });
    }

    // Update transformedResume with current GitHub and LinkedIn URLs
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'transformedResume.github': user.githubProfile?.url || '',
          'transformedResume.linkedin': user.linkedInProfile || '',
          'transformedResume.updatedAt': new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    console.log('✅ Successfully updated transformedResume URLs');
    console.log('Updated URLs:', {
      github: updatedUser?.transformedResume?.github,
      linkedin: updatedUser?.transformedResume?.linkedin
    });

    res.json({
      success: true,
      message: 'Transformed resume URLs updated successfully',
      data: {
        github: updatedUser?.transformedResume?.github,
        linkedin: updatedUser?.transformedResume?.linkedin
      }
    });
  } catch (error) {
    console.error('Error updating transformed resume URLs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transformed resume URLs'
    });
  }
}; 