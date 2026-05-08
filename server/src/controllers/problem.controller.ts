import { Request, Response } from 'express';
import { z } from 'zod';
import Problem from '../models/Problem.model';

const problemSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  tags: z.array(z.string()),
  description: z.string().min(10),
  constraints: z.string().optional(),
  examples: z.array(z.object({ input: z.string(), output: z.string(), explanation: z.string().optional() })),
  testCases: z.array(z.object({ input: z.string(), expectedOutput: z.string(), isHidden: z.boolean().default(false) })),
  starterTemplates: z.record(z.string(), z.string()).optional(),
  hints: z.array(z.string()).optional(),
});

export const getProblems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { difficulty, tag, search, page = '1', limit = '20' } = req.query;
    const filter: Record<string, unknown> = { isPublished: true };

    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = { $in: [tag] };
    if (search) filter.title = { $regex: search, $options: 'i' };

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .select('title slug difficulty tags acceptanceRate totalSubmissions isPublished')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Problem.countDocuments(filter),
    ]);

    res.json({ problems, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
};

export const getProblemBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug, isPublished: true })
      .select('-testCases.isHidden');
    if (!problem) { res.status(404).json({ error: 'Problem not found' }); return; }
    // Only send non-hidden test cases
    const sanitized = { ...problem.toObject(), testCases: problem.testCases.filter((tc) => !tc.isHidden) };
    res.json(sanitized);
  } catch {
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
};

export const createProblem = async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    const data = problemSchema.parse(req.body);
    const problem = await Problem.create({ ...data, createdBy: req.user!.id } as any);
    res.status(201).json(problem);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues[0].message }); return; }
    res.status(500).json({ error: 'Failed to create problem' });
  }
};

export const publishProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, { isPublished: true }, { new: true });
    if (!problem) { res.status(404).json({ error: 'Problem not found' }); return; }
    res.json(problem);
  } catch {
    res.status(500).json({ error: 'Failed to publish problem' });
  }
};

export const updateProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) { res.status(404).json({ error: 'Problem not found' }); return; }
    res.json(problem);
  } catch {
    res.status(500).json({ error: 'Failed to update problem' });
  }
};
