import { Request, Response } from 'express';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 3,
      search,
      category,
      location,
      employmentType,
      experienceLevel,
      isRemote,
      isHybrid,
      isOnsite,
    } = req.query;

    const query: any = { isActive: true };

    // Search functionality
    if (search) {
      query.$text = { $search: search as string };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by employment type
    if (employmentType) {
      query.employmentType = employmentType;
    }

    // Filter by experience level
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Filter by work arrangement
    if (isRemote === 'true') {
      query.isRemote = true;
    }
    if (isHybrid === 'true') {
      query.isHybrid = true;
    }
    if (isOnsite === 'true') {
      query.isOnsite = true;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalJobs: total,
        hasNext: skip + jobs.length < total,
        // hasNext: Number(page) < Math.ceil(total / Number(limit)),
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error: any) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Error fetching job' });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const jobData = req.body;
    const job = new Job(jobData);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    // res.status(400).json({ message: 'Error creating job', error: error.message });
    res.status(400).json();

  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    // res.status(400).json({ message: 'Error updating job', error: error.message });
    res.status(400).json();

  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Error deleting job' });
  }
};

export const getJobCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Job.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching job categories:', error);
    res.status(500).json({ message: 'Error fetching job categories' });
  }
};

export const getJobStats = async (req: Request, res: Response) => {
  try {
    const stats = await Job.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          byCategory: {
            $push: {
              category: '$category',
              count: 1,
            },
          },
          byEmploymentType: {
            $push: {
              type: '$employmentType',
              count: 1,
            },
          },
          byExperienceLevel: {
            $push: {
              level: '$experienceLevel',
              count: 1,
            },
          },
        },
      },
    ]);

    res.json(stats[0] || { totalJobs: 0, byCategory: [], byEmploymentType: [], byExperienceLevel: [] });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ message: 'Error fetching job statistics' });
  }
}; 

export const incrementApplyClickCount = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const job = await Job.findByIdAndUpdate(
      jobId,
      { $inc: { applyClickCount: 1 } },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ 
      success: true, 
      message: 'Apply click count incremented successfully',
      applyClickCount: job.applyClickCount 
    });
  } catch (error: any) {
    console.error('Error incrementing apply click count:', error);
    res.status(500).json({ message: 'Error incrementing apply click count' });
  }
}; 