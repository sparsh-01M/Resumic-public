import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  originalName: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  atsScore?: number;
  uploadedAt: Date;
  lastAccessed?: Date;
  fileSize: number;
  fileType: string;
}

const resumeSchema = new Schema<IResume>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  atsScore: {
    type: Number,
    min: 0,
    max: 100
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastAccessed: {
    type: Date
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  }
});

// Compound index for efficient queries
resumeSchema.index({ userId: 1, uploadedAt: -1 });

// TTL index to automatically delete old resumes (keep only last 10)
// This will be handled manually in the controller for better control

export const Resume = mongoose.model<IResume>('Resume', resumeSchema); 