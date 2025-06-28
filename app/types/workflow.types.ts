export type Workflow = {
  id: string;
  name: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type WorkflowExecution = {
  id: string;
  workflowId: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
};
