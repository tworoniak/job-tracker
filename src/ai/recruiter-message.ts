import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function tryExtractJson(text: string): unknown {
  // Best-effort: find first JSON object in the response
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const slice = text.slice(start, end + 1);
    return JSON.parse(slice);
  }
  return JSON.parse(text);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: 'Missing OPENAI_API_KEY' });
    return;
  }

  try {
    const { company, jobTitle, jobUrl, notes, tone } = req.body ?? {};

    if (!company || !jobTitle) {
      res.status(400).json({ error: 'company and jobTitle are required' });
      return;
    }

    const model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';

    const prompt = [
      `You draft outreach messages to recruiters.`,
      `Return ONLY valid JSON with keys: subject, message.`,
      ``,
      `Context:`,
      `- Company: ${company}`,
      `- Role: ${jobTitle}`,
      jobUrl ? `- Job URL: ${jobUrl}` : `- Job URL: (not provided)`,
      notes ? `- Candidate notes: ${notes}` : `- Candidate notes: (none)`,
      `- Tone: ${tone ?? 'friendly and concise'}`,
      ``,
      `Constraints:`,
      `- Message length: 80–140 words`,
      `- Be specific but do not invent facts`,
      `- Include a clear call to action (e.g., 10–15 min chat)`,
    ].join('\n');

    const response = await client.responses.create({
      model,
      input: prompt,
    });

    const raw = response.output_text?.trim() ?? '';
    const data = tryExtractJson(raw) as { subject?: string; message?: string };

    if (!data?.subject || !data?.message) {
      res
        .status(502)
        .json({ error: 'Model did not return expected JSON', raw });
      return;
    }

    res.status(200).json({
      subject: data.subject.trim(),
      message: data.message.trim(),
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Failed to generate message',
      detail: err?.message ?? String(err),
    });
  }
}
