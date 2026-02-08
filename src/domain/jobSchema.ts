import { z } from 'zod';

export const columnIdSchema = z.enum([
  'applied',
  'interview',
  'offer',
  'rejected',
]);

export const workModeSchema = z.enum(['remote', 'hybrid', 'onsite']);

export const jobSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  link: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^https?:\/\//i.test(v),
      'Link must start with http(s)://',
    ),
  appliedDate: z.string().min(1, 'Date is required'),
  columnId: columnIdSchema,
  workMode: workModeSchema.optional(),

  // NEW: free-form input that we'll parse on submit
  techStackInput: z.string().optional(),
});

export type JobFormValues = z.infer<typeof jobSchema>;
