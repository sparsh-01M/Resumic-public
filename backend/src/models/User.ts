import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ParsedResumeData {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationYear: string;
    startYear?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  achievements: Array<{
    title: string;
    type: 'achievement' | 'competition' | 'hackathon';
    date: string;
    description: string;
    position?: string;
    organization?: string;
    url?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    duration?: string;
    url?: string;
  }>;
  skills: string[];
  parsedAt?: Date;
}

export interface GitHubProfile {
  username: string;
  url: string;
  connectedAt: Date;
}

export interface LinkedInData {
  name: string;
  headline: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    duration: string;
  }>;
  skills: string[];
  languages: string[];
}

export interface GitHubProject {
  name: string;
  description: string;
  url: string;
  technologies: string[];
  atsPoints: string[];
  developmentDuration?: string;
  stars: number;
  language: string;
  analysis: string;
  lastUpdated: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  resumeUrl?: string;
  resumeUploadedAt?: Date;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  githubProfile?: GitHubProfile;
  githubProjects?: GitHubProject[];
  githubConnected: boolean;
  githubLastUpdated?: Date;
  parsedResume?: ParsedResumeData;
  linkedInProfile?: string;
  linkedInData?: LinkedInData;
  linkedInConnected: boolean;
  linkedInLastUpdated?: Date;
  selectedTemplate?: {
    id: string;
    name: string;
    filePath: string;
    selectedAt: Date;
  };
  transformedResume?: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    education: Array<{
      startDate: string;
      endDate: string;
      institution: string;
      degree: string;
      gpa?: string;
      coursework?: string;
    }>;
    experience: Array<{
      startDate: string;
      endDate: string;
      title: string;
      company: string;
      location: string;
      highlights: string[];
    }>;
    projects: Array<{
      name: string;
      link?: string;
      date?: string;
      description: string[];
      technologies?: string;
    }>;
    skills: Array<{
      category: string;
      items: string;
    }>;
    updatedAt: Date;
  };
  firebaseUid?: string;
  provider?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    resumeUrl: {
      type: String,
    },
    resumeUploadedAt: {
      type: Date,
    },
    skills: {
      type: [String],
      default: [],
    },
    githubProfile: {
      username: String,
      url: String,
      connectedAt: Date,
    },
    githubProjects: [{
      name: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      technologies: [{
        type: String,
        required: true
      }],
      atsPoints: [{
        type: String,
        required: true
      }],
      developmentDuration: {
        type: String
      },
      stars: {
        type: Number,
        required: true
      },
      language: {
        type: String,
        required: true
      },
      analysis: {
        type: String,
        required: true
      },
      lastUpdated: {
        type: Date,
        required: true
      }
    }],
    githubConnected: { type: Boolean, default: false },
    githubLastUpdated: { type: Date },
    parsedResume: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      location: { type: String },
      summary: { type: String },
      experience: [{
        company: { type: String },
        position: { type: String },
        duration: { type: String },
        description: { type: String }
      }],
      education: [{
        institution: { type: String },
        degree: { type: String },
        field: { type: String },
        graduationYear: { type: String },
        startYear: { type: String }
      }],
      certifications: [{
        name: { type: String },
        issuer: { type: String },
        date: { type: String },
        url: { type: String }
      }],
      achievements: [{
        title: { type: String },
        type: { type: String, enum: ['achievement', 'competition', 'hackathon'] },
        date: { type: String },
        description: { type: String },
        position: { type: String },
        organization: { type: String },
        url: { type: String }
      }],
      projects: [{
        name: { type: String },
        description: { type: String },
        technologies: [{ type: String }],
        duration: { type: String },
        url: { type: String }
      }],
      skills: [{ type: String }],
      parsedAt: { type: Date, default: Date.now }
    },
    linkedInProfile: { type: String },
    linkedInData: {
      type: Object,
      default: {}
    },
    linkedInConnected: { type: Boolean, default: false },
    linkedInLastUpdated: { type: Date },
    selectedTemplate: {
      id: { type: String },
      name: { type: String },
      filePath: { type: String },
      selectedAt: { type: Date, default: Date.now }
    },
    transformedResume: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      location: { type: String },
      website: { type: String },
      linkedin: { type: String },
      github: { type: String },
      education: [{
        startDate: { type: String },
        endDate: { type: String },
        institution: { type: String },
        degree: { type: String },
        gpa: { type: String },
        coursework: { type: String }
      }],
      experience: [{
        startDate: { type: String },
        endDate: { type: String },
        title: { type: String },
        company: { type: String },
        location: { type: String },
        highlights: [{ type: String }]
      }],
      projects: [{
        name: { type: String },
        link: { type: String },
        date: { type: String },
        description: [{ type: String }],
        technologies: { type: String }
      }],
      skills: [{
        category: { type: String },
        items: { type: String }
      }],
      updatedAt: { type: Date, default: Date.now }
    },
    firebaseUid: {
      type: String,
      index: true,
      sparse: true,
    },
    provider: {
      type: String,
      default: 'local', // 'local', 'google', 'firebase', etc.
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 