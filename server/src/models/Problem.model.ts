import mongoose, { Schema, Document } from 'mongoose';

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

export interface IProblem extends Document {
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  description: string;
  constraints: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  testCases: ITestCase[];
  starterTemplates: Record<string, string>;
  hints: string[];
  acceptanceRate: number;
  totalSubmissions: number;
  totalAccepted: number;
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
}

const ProblemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    tags: [{ type: String }],
    description: { type: String, required: true },
    constraints: { type: String, default: '' },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    testCases: [
      {
        input: { type: String, default: '' },
        expectedOutput: { type: String, default: '' },
        isHidden: { type: Boolean, default: false },
        explanation: String,
      },
    ],
    starterTemplates: {
      type: Map,
      of: String,
      default: {},
    },
    hints: [String],
    acceptanceRate: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    totalAccepted: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);
ProblemSchema.index({ difficulty: 1, tags: 1 });

export default mongoose.model<IProblem>('Problem', ProblemSchema);
