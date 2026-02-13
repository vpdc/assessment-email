export enum WorkflowState {
  Running = "RUNNING",
  Completed = "COMPLETED",
}

export type WorkflowInfo = {
  status: WorkflowState;
  currentStepIndex: number;
  stepsVersion: number;
};
