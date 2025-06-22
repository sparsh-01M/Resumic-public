import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  jobTitle: string;
  companyName: string;
  companyOverview: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance';
  salaryRange?: string;
  jobDescription: string;
  responsibilities: string[];
  requirements: {
    required: string[];
    preferred?: string[];
  };
  applicationDeadline?: Date;
  applicationLink: string;
  educationLevel?: string;
  experienceLevel: 'Entry-level' | 'Mid-level' | 'Senior' | 'Executive';
  category: 'tech' | 'sales' | 'marketing' | 'design' | 'product' | 'operations' | 'finance' | 'hr' | 'other';
  isRemote: boolean;
  isHybrid: boolean;
  isOnsite: boolean;
  applyClickCount: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const jobSchema = new Schema<IJob>(
  {
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyOverview: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
      required: true,
    },
    salaryRange: {
      type: String,
      trim: true,
    },
    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },
    responsibilities: {
      type: [String],
      required: true,
      validate: {
        validator: function(v: string[]) {
          return v.length > 0;
        },
        message: 'At least one responsibility is required',
      },
    },
    requirements: {
      required: {
        type: [String],
        required: true,
        validate: {
          validator: function(v: string[]) {
            return v.length > 0;
          },
          message: 'At least one required qualification is needed',
        },
      },
      preferred: {
        type: [String],
        default: [],
      },
    },
    applicationDeadline: {
      type: Date,
    },
    applicationLink: {
      type: String,
      required: true,
      trim: true,
    },
    educationLevel: {
      type: String,
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ['Entry-level', 'Mid-level', 'Senior', 'Executive'],
      required: true,
    },
    category: {
      type: String,
      enum: ['tech', 'sales', 'marketing', 'design', 'product', 'operations', 'finance', 'hr', 'other'],
      required: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    isHybrid: {
      type: Boolean,
      default: false,
    },
    isOnsite: {
      type: Boolean,
      default: false,
    },
    applyClickCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
jobSchema.index({ jobTitle: 'text', companyName: 'text', location: 'text', category: 1 });
jobSchema.index({ isActive: 1, createdAt: -1 });

export const Job = mongoose.model<IJob>('Job', jobSchema); 