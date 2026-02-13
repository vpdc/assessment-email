import { z } from 'zod';
import { StepSchema } from './cadence.schema';

export const CreateEnrollmentSchema = z.object({
  cadenceId: z.string(),
  contactEmail: z.email(),
});

export const UpdateCadenceSchema = z.object({
  steps: z.array(StepSchema),
});

export const EmailCadenceWorkflowInputSchema = z.object({
  steps: z.array(StepSchema),
  contactEmail: z.email(),
});

export type EmailCadenceWorkflowInput = z.infer<typeof EmailCadenceWorkflowInputSchema>;
export type CreateEnrollmentDto = z.infer<typeof CreateEnrollmentSchema>;
export type UpdateCadenceDto = z.infer<typeof UpdateCadenceSchema>;
