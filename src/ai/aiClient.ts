import {
  recruiterMessageRequestSchema,
  recruiterMessageResponseSchema,
  type RecruiterMessageRequest,
  type RecruiterMessageResponse,
} from './schemas';

export async function generateRecruiterMessage(
  payload: RecruiterMessageRequest,
): Promise<RecruiterMessageResponse> {
  const parsed = recruiterMessageRequestSchema.parse(payload);

  const res = await fetch('/api/ai/recruiter-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.detail ?? json?.error ?? 'AI request failed');
  }

  return recruiterMessageResponseSchema.parse(json);
}
