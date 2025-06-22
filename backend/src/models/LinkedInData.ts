import mongoose, { Document, Schema } from 'mongoose';

export interface ILinkedInData extends Document {
  userId: mongoose.Types.ObjectId;
  profileUrl: string;
  data: {
    id: string;
    firstName: string;
    lastName: string;
    headline: string;
    email: string;
  };
  lastUpdated: Date;
}

const linkedInDataSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  profileUrl: {
    type: String,
    required: false
  },
  data: {
    id: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    headline: { type: String },
    email: { type: String },
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

export const LinkedInData = mongoose.model<ILinkedInData>('LinkedInData', linkedInDataSchema); 