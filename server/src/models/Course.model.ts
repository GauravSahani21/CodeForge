import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson {
  _id: mongoose.Types.ObjectId;
  title: string;
  order: number;
  content: string;
  codeLanguage: string;
  codeExample: string;
  quiz?: Array<{ question: string; options: string[]; answer: number }>;
  duration: number;
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  thumbnail?: string;
  lessons: ILesson[];
  enrolledCount: number;
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true },
  order: { type: Number, required: true },
  content: { type: String, required: true },
  codeLanguage: { type: String, default: 'python' },
  codeExample: { type: String, default: '' },
  quiz: [
    {
      question: String,
      options: [String],
      answer: Number,
    },
  ],
  duration: { type: Number, default: 5 },
});

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    tags: [String],
    thumbnail: String,
    lessons: [LessonSchema],
    enrolledCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>('Course', CourseSchema);
