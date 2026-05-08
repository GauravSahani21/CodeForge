import { Request, Response } from 'express';
import { z } from 'zod';
import { executeCode, LANGUAGE_RUNTIMES } from '../services/piston.service';

const executeSchema = z.object({
  language: z.string(),
  sourceCode: z.string().min(1).max(50000),
  stdin: z.string().max(10000).optional(),
});

export const runCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { language, sourceCode, stdin } = executeSchema.parse(req.body);

    if (!LANGUAGE_RUNTIMES[language]) {
      res.status(400).json({ error: `Unsupported language: ${language}`, supported: Object.keys(LANGUAGE_RUNTIMES) });
      return;
    }

    const result = await executeCode(language, sourceCode, stdin || '');
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0].message });
      return;
    }
    console.error('Execution Error:', err instanceof Error ? err.message : err);
    if ((err as any).response) {
      console.error('Piston Response data:', (err as any).response.data);
    }
    res.status(500).json({ error: 'Execution failed. Please try again.', details: (err as any).response?.data });
  }
};

export const getSupportedLanguages = (_req: Request, res: Response): void => {
  res.json(Object.keys(LANGUAGE_RUNTIMES).map((lang) => ({ id: lang, ...LANGUAGE_RUNTIMES[lang] })));
};
