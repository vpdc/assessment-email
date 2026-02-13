import { z } from 'zod';

export enum StepType {
  Wait = 'WAIT',
  SendEmail = 'SEND_EMAIL',
}

const SendEmailStepSchema = z.object({
  id: z.string(),
  type: z.literal(StepType.SendEmail),
  subject: z.string(),
  body: z.string(),
});

const WaitStepSchema = z.object({
  id: z.string(),
  type: z.literal(StepType.Wait),
  seconds: z.number().int().positive(),
});

export const StepSchema = z.discriminatedUnion('type', [
  SendEmailStepSchema,
  WaitStepSchema,
]);

export const CadenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  steps: z.array(StepSchema),
});

export type Cadence = z.infer<typeof CadenceSchema>;
export type Step = z.infer<typeof StepSchema>;
