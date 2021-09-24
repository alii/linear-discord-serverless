import {z} from 'zod';
import {Action, createAllStates, dateSchema, defaultRemoveSchema} from './util';

const commons = z.object({
	id: z.string().uuid(),
	createdAt: dateSchema,
	updatedAt: dateSchema,
	number: z.number().positive(),
	title: z.string(),
	description: z.string(),
	priority: z.number(),
	boardOrder: z.number(),
	sortOrder: z.number(),
	previousIdentifiers: z.array(z.string()),
	priorityLabel: z.string(),
	teamId: z.string().uuid(),
	stateId: z.string().uuid(),
	assigneeId: z.string().uuid().optional(),
	subscriberIds: z.array(z.string().uuid()),
	creatorId: z.string().uuid(),
	labelIds: z.array(z.string().uuid()),
	state: z.object({
		id: z.string().uuid(),
		name: z.string(),
		color: z.string(),
		type: z.string(),
	}),
	team: z.object({
		id: z.string().uuid(),
		name: z.string(),
		key: z.string(),
	}),
	labels: z.array(
		z.object({
			id: z.string().uuid(),
			name: z.string(),
			color: z.string(),
		}),
	),
});

export const issue = createAllStates(commons, defaultRemoveSchema).and(
	z.object({
		type: z.literal('Issue'),
		url: z.string().url(),
	}),
);
