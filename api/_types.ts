export interface Field {
  name: string;
  value: string;
  inline?: boolean;
}

export interface IncomingLinearWebhookPayload {
  action: 'create' | 'update' | 'remove';
  data: Data;
  type: string;
  createdAt: string;
  updatedFrom?: UpdatedFrom;
  url: string;
}

export interface Data {
  id: string;
  title?: string;
  subscriberIds?: string[];
  previousIdentifiers?: unknown[];
  createdAt: string;
  updatedAt: string;
  archivedAt: string;
  number?: number;
  description?: string;
  documentVersion?: number;
  priority?: number;
  estimate: number;
  boardOrder?: number;
  startedAt: string;
  completedAt: string;
  canceledAt: string;
  autoClosedAt: string;
  autoArchivedAt: string;
  dueDate: string;
  labelIds?: string[];
  teamId?: string;
  cycleId?: string;
  projectId?: string;
  creatorId?: string;
  assigneeId?: string;
  stateId?: string;
  parentId: string;
  source?: string;
  priorityLabel?: string;
  labels?: Label[];
  team?: Team;
  state?: State;
  body?: string;
  edited?: boolean;
  issueId?: string;
  userId?: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Team {
  id: string;
  name: string;
  key: string;
}

export interface State {
  id: string;
  name: string;
  color: string;
  description: unknown;
  type: string;
}

export interface UpdatedFrom {
  updatedAt: string;
  labelIds?: unknown[];
  priorityLabel: string;
  labels: unknown[];
  priority?: number;
}
