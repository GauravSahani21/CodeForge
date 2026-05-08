import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  joinedAt: Date;
  stats: {
    solved: number;
    attempted: number;
    streak: number;
    lastActive?: Date;
  };
  activityLog: Array<{ date: string; count: number; level: number }>;
  solvedProblems: mongoose.Types.ObjectId[];
  badges: string[];
  resetOtp?: string;
  resetOtpExpiry?: Date;
  resetOtpAttempts?: number;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String },
    bio: { type: String, maxlength: 300 },
    joinedAt: { type: Date, default: Date.now },
    stats: {
      solved: { type: Number, default: 0 },
      attempted: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      lastActive: { type: Date },
    },
    activityLog: [
      {
        date: String,
        count: { type: Number, default: 0 },
        level: { type: Number, default: 0, min: 0, max: 4 },
      },
    ],
    solvedProblems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
    badges: [String],
    resetOtp: { type: String, select: false },
    resetOtpExpiry: { type: Date, select: false },
    resetOtpAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

export default mongoose.model<IUser>('User', UserSchema);
