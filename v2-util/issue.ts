import {z} from 'zod';
import {createAllStates, dateResolvable, defaultRemoveSchema} from './util';

const team = z.object({
	id: z.string().uuid(),
	name: z.string(),
	key: z.string(),
});

const label = z.object({
	id: z.string().uuid(),
	name: z.string(),
	color: z.string(),
});

const state = z.object({
	id: z.string().uuid(),
	name: z.string(),
	color: z.string(),
	type: z.string(),
});

const commons = z.object({
	id: z.string().uuid(),
	createdAt: dateResolvable,
	updatedAt: dateResolvable,
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
	state,
	team,
	labels: z.array(label).optional(),
});

export const issue = createAllStates(commons, defaultRemoveSchema).and(
	z.object({
		type: z.literal('Issue'),
		url: z.string().url(),
	}),
);
