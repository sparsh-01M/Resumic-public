import mongoose, { Schema, Document } from 'mongoose';

export interface IWaitlist extends Document {
  name: string;
  email: string;
  joinedAt: Date;
}

const waitlistSchema = new Schema<IWaitlist>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  joinedAt: { type: Date, default: Date.now }
});

export const Waitlist = mongoose.model<IWaitlist>('Waitlist', waitlistSchema); 