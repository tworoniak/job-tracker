import { z } from 'zod';

export const recruiterMessageRequestSchema = z.object({
  company: z.string().min(1),
  jobTitle: z.string().min(1),
  jobUrl: z.string().url().optional().or(z.literal('')).optional(),
  notes: z.string().optional(),
  tone: z.enum(['friendly', 'direct', 'formal']).optional(),
});

export type RecruiterMessageRequest = z.infer<
  typeof recruiterMessageRequestSchema
>;

export const recruiterMessageResponseSchema = z.object({
  subject: z.string().min(1),
  message: z.string().min(1),
});

export type RecruiterMessageResponse = z.infer<
  typeof recruiterMessageResponseSchema
>;
