import { Injectable, NotFoundException } from '@nestjs/common';
import { TemporalService } from '../temporal/temporal.service';
import {
  CreateEnrollmentDto,
  Step,
  type EmailCadenceWorkflowInput,
} from '@repo/common';
import { Client, WorkflowIdReusePolicy } from '@temporalio/client';
import { CadenceService } from '../cadence/cadence.service';

@Injectable()
export class EnrollmentService {
  private client: Client;

  constructor(
    private readonly temporal: TemporalService,
    private readonly cadence: CadenceService,
  ) {
    this.client = this.temporal.clientInstance;
  }

  async create(body: CreateEnrollmentDto) {
    const { cadenceId, contactEmail } = body;
    const enrollmentId = `/enrollments/${cadenceId}:${contactEmail}`;
    const cadence = this.cadence.get(body.cadenceId);

    if (!cadence) {
      throw new NotFoundException(`Cadence not found id (${cadenceId})`);
    }

    const workflowInput: EmailCadenceWorkflowInput = {
      steps: cadence.steps,
      contactEmail: body.contactEmail,
    };

    await this.client.workflow.start('emailCadenceWorkflow', {
      workflowId: enrollmentId,
      taskQueue: process.env.TEMPORAL_TASK_QUEUE!,
      args: [workflowInput],
      workflowIdReusePolicy: WorkflowIdReusePolicy.REJECT_DUPLICATE,
    });

    return { enrollmentId };
  }

  async getState(enrollmentId: string) {
    const handle = this.client.workflow.getHandle(
      `/enrollments/${enrollmentId}`,
    );

    try {
      return await handle.query('getState');
    } catch {
      throw new NotFoundException('Enrollment not found');
    }
  }

  async updateCadence(enrollmentId: string, steps: Array<Step>) {
    const handle = this.client.workflow.getHandle(
      `/enrollments/${enrollmentId}`,
    );

    await handle.signal('updateCadence', steps);

    return { success: true };
  }
}
