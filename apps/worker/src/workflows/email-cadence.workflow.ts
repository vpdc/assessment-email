import { proxyActivities, defineSignal, defineQuery, log, setHandler, condition,  } from '@temporalio/workflow';
import type { SendEmailResult } from '../activities/email.activity';
import { EmailCadenceWorkflowInput, Step, StepType, WorkflowInfo, WorkflowState } from '@repo/common';

const { sendEmail } = proxyActivities<{
  sendEmail(step: any): Promise<SendEmailResult>;
}>({
  startToCloseTimeout: '1 minute',
});

export const updateCadence = defineSignal<[Step[]]>('updateCadence');

export const getState = defineQuery<WorkflowInfo>('getState');

export async function emailCadenceWorkflow(input: EmailCadenceWorkflowInput) {
  let steps = input.steps;
  let currentStepIndex = 0;
  let stepsVersion = 1;
  let status = WorkflowState.Running;
  let hasUpdatedCadence = false

  setHandler(updateCadence, (newSteps) => {
    steps = newSteps;
    stepsVersion++;
    hasUpdatedCadence = true
    if (currentStepIndex >= steps.length) {
      status = WorkflowState.Completed;
    }
  });

  setHandler(getState, () => ({
    status,
    currentStepIndex,
    stepsVersion,
  }));

  while (currentStepIndex < steps.length && status === WorkflowState.Running) {
    const step = steps[currentStepIndex];

    if (step.type === StepType.Wait) {
      hasUpdatedCadence = false
      const isInterrupted = await condition(() => hasUpdatedCadence, step.seconds * 1000)

      if (isInterrupted) {
        continue
      }
    }

    if (step.type === StepType.SendEmail) {
      await sendEmail({
        ...step,
        to: input.contactEmail,
      });
    }

    currentStepIndex++;
  }

  status = WorkflowState.Completed;
}
