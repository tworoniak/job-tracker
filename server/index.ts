import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('Missing OPENAI_API_KEY. Add it to .env.local');
}

const client = new OpenAI({ apiKey });

type RecruiterMessageBody = {
  company: string;
  jobTitle: string;
  jobUrl?: string;
  notes?: string;
  tone?: 'friendly' | 'direct' | 'formal' | string;
};

type Empty = Record<string, never>;

function extractJson(text: string): { subject: string; message: string } {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  const jsonText =
    start >= 0 && end > start ? text.slice(start, end + 1) : text;
  const parsed = JSON.parse(jsonText) as {
    subject?: unknown;
    message?: unknown;
  };

  if (
    typeof parsed.subject !== 'string' ||
    typeof parsed.message !== 'string'
  ) {
    throw new Error('AI returned invalid JSON shape');
  }
  return { subject: parsed.subject.trim(), message: parsed.message.trim() };
}

app.post(
  '/api/ai/recruiter-message',
  async (req: Request<Empty, unknown, RecruiterMessageBody>, res: Response) => {
    try {
      const { company, jobTitle, jobUrl, notes, tone } =
        req.body ?? ({} as RecruiterMessageBody);

      if (!company || !jobTitle) {
        res.status(400).json({ error: 'company and jobTitle are required' });
        return;
      }

      const model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';

      const prompt = `
You draft outreach messages to recruiters.

Return ONLY valid JSON:
{
  "subject": "...",
  "message": "..."
}

Context:
- Company: ${company}
- Role: ${jobTitle}
- Job URL: ${jobUrl ?? '(not provided)'}
- Candidate notes: ${notes ?? '(none)'}
- Tone: ${tone ?? 'friendly'}

Constraints:
- 80–140 words
- Do not invent facts
- Include a clear call to action (10–15 minute chat)
`.trim();

      const response = await client.responses.create({
        model,
        input: prompt,
      });

      const text = response.output_text?.trim() ?? '';
      if (!text) {
        res.status(502).json({ error: 'Empty response from AI' });
        return;
      }

      const parsed = extractJson(text);
      res.status(200).json(parsed);
    } catch (err: unknown) {
      console.error('AI ERROR:', err);

      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: 'AI generation failed', detail: message });
    }
  },
);

const PORT = 5181;
app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});
