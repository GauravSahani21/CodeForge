import { Request, Response } from 'express';
import { z } from 'zod';
import Problem from '../models/Problem.model';
import Submission from '../models/Submission.model';
import User from '../models/User.model';
import { executeCode } from '../services/piston.service';

const submitSchema = z.object({
  problemId: z.string(),
  language: z.string(),
  sourceCode: z.string().min(1).max(50000),
});

// Helper: update user's activity heatmap
async function updateUserActivity(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const user = await User.findById(userId);
  if (!user) return;

  const existing = user.activityLog.find((a) => a.date === today);
  if (existing) {
    existing.count += 1;
    existing.level = Math.min(4, Math.ceil(existing.count / 3));
  } else {
    user.activityLog.push({ date: today, count: 1, level: 1 });
  }

  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const hadActivityYesterday = user.activityLog.some((a) => a.date === yesterdayStr);
  user.stats.streak = hadActivityYesterday ? user.stats.streak + 1 : 1;
  user.stats.lastActive = new Date();

  await user.save();
}

export const submitCode = async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    const { problemId, language, sourceCode } = submitSchema.parse(req.body);
    const userId = req.user!.id;

    const problem = await Problem.findById(problemId);
    if (!problem) { res.status(404).json({ error: 'Problem not found' }); return; }

    if (!problem.testCases || problem.testCases.length === 0) {
      res.status(400).json({ error: 'This problem has no test cases configured yet.' });
      return;
    }

    // Create submission in pending state
    const submission = await Submission.create({
      userId,
      problemId,
      language,
      sourceCode,
      status: 'Running',
      passedCount: 0,
      totalCount: problem.testCases.length,
    });

    // Run all test cases
    const testResults = [];
    let passedCount = 0;
    let allPassed = true;
    let totalRuntime = 0;
    let globalStderr = '';

    for (const tc of problem.testCases) {
      const result = await executeCode(language, sourceCode, tc.input);
      const normalizeStr = (s: string) => s.split('\n').map((l) => l.trimEnd()).join('\n').trim();
      const passed = normalizeStr(result.stdout) === normalizeStr(tc.expectedOutput) && result.exitCode === 0;
      if (!passed) allPassed = false;
      if (passed) passedCount++;
      totalRuntime += result.runtime;

      if (result.stderr) globalStderr = result.stderr;

      testResults.push({
        passed,
        input: tc.isHidden ? '(hidden)' : tc.input,
        expected: tc.isHidden ? '(hidden)' : tc.expectedOutput,
        actual: tc.isHidden ? (passed ? '(correct)' : '(wrong answer)') : result.stdout,
        isHidden: tc.isHidden,
        runtime: result.runtime,
      });

      // Stop early on compile/runtime errors — no point running more cases
      if (result.stderr && result.exitCode !== 0) {
        const errorStatus = result.stderr.toLowerCase().includes('error') && result.exitCode !== 0
          ? 'Runtime Error'
          : 'Runtime Error';

        await submission.updateOne({
          status: errorStatus,
          stderr: result.stderr,
          testResults,
          runtime: totalRuntime,
          passedCount,
          totalCount: problem.testCases.length,
        });
        await updateUserActivity(userId);
        await problem.updateOne({ $inc: { totalSubmissions: 1 } });
        await User.findByIdAndUpdate(userId, { $inc: { 'stats.attempted': 1 } });

        res.json({
          submissionId: submission.id,
          status: errorStatus,
          testResults,
          stderr: result.stderr,
          passedCount,
          totalCount: problem.testCases.length,
          runtime: totalRuntime,
        });
        return;
      }
    }

    const finalStatus = allPassed ? 'Accepted' : 'Wrong Answer';
    const avgRuntime = Math.round(totalRuntime / problem.testCases.length);

    await submission.updateOne({
      status: finalStatus,
      testResults,
      runtime: avgRuntime,
      stderr: globalStderr || undefined,
      passedCount,
      totalCount: problem.testCases.length,
    });

    // Update problem stats
    await problem.updateOne({
      $inc: { totalSubmissions: 1, ...(allPassed ? { totalAccepted: 1 } : {}) },
    });

    // Update user stats
    if (allPassed) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { solvedProblems: problemId },
        $inc: { 'stats.solved': 1 },
      });
    }
    await User.findByIdAndUpdate(userId, { $inc: { 'stats.attempted': 1 } });
    await updateUserActivity(userId);

    res.json({
      submissionId: submission.id,
      status: finalStatus,
      testResults,
      runtime: avgRuntime,
      stderr: globalStderr || undefined,
      passedCount,
      totalCount: problem.testCases.length,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues[0].message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Submission failed' });
  }
};

export const getUserSubmissions = async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    const { problemId } = req.query;
    const query: Record<string, string> = { userId: req.user!.id };
    if (problemId) query.problemId = problemId as string;

    const submissions = await Submission.find(query)
      .sort({ submittedAt: -1 })
      .limit(20)
      .populate('problemId', 'title slug difficulty');

    res.json(submissions);
  } catch {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};
