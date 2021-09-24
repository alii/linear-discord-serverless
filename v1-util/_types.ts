export type Action = 'create' | 'update' | 'remove' | string;

export type RequestBody = {
	action: Action;
	createdAt: string;
	url: string;
} & (
	| {
			type: 'Issue';
			data: Issue;
	  }
	| {
			type: 'Comment';
			data: Comment;
	  }
);

export type Issue = {
	id: string;
	title: string;
	subscriberIds: string[];
	previousIdentifiers: Issue['id'][];
	createdAt: string;
	updatedAt: string;
	archivedAt: string;
	number: number;
	description?: string;
	documentVersion: number;
	priority: number;
	estimate: number;
	boardOrder: number;
	startedAt: string;
	completedAt: string;
	canceledAt: string;
	autoClosedAt: string;
	autoArchivedAt: string;
	dueDate: string;
	searchVector: string;
	labelIds: string[];
	teamId: string;
	cycleId: string;
	projectId: string;
	creatorId: string;
	assigneeId: string;
	stateId: string;
	parentId: string;
	source: string;
	priorityLabel: string;
	labels: Label[];
	team: Team;
	state: State;
};

export interface Comment {
	id: string;
	reactionData: unknown[];
	createdAt: string;
	updatedAt: string;
	archivedAt: string;
	body: string;
	issueId: string;
	userId: string;
	editedAt: string;
	edited: boolean;
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
	description: string;
	type: string;
}
