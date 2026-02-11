import { z } from 'zod';

// Todo validation schema
export const todoSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(500, 'Title must be less than 500 characters'),
  notes: z.string()
    .max(200, 'Notes must be less than 200 characters')
    .optional()
    .nullable(),
  due_date: z.string()
    .optional()
    .nullable(),
  recurrence_type: z.enum(['daily', 'weekdays', 'weekends', 'weekly', 'monthly', 'yearly'])
    .optional()
    .nullable(),
});

export type TodoInput = z.infer<typeof todoSchema>;

// Profile validation schema
export const profileSchema = z.object({
  display_name: z.string()
    .trim()
    .min(1, 'Display name cannot be empty')
    .max(100, 'Display name must be less than 100 characters')
    .optional()
    .nullable(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
