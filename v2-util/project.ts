import {z} from 'zod';
import {createAllStates, dateResolvable, defaultRemoveSchema} from './util';

const commons = z.object({
	id: z.string().uuid(),
	createdAt: dateResolvable,
	updatedAt: dateResolvable,
	name: z.string(),
	description: z.string(),
	slugId: z.string(),
	color: z.string(),
	state: z.string(),
	creatorId: z.string().uuid(),
	sortOrder: z.number(),
	// TODO(@alii): Find out the type for these arrays
	issueCountHistory: z.array(z.unknown()),
	completedIssueCountHistory: z.array(z.unknown()),
	scopeHistory: z.array(z.unknown()),
	completedScopeHistory: z.array(z.unknown()),
	slackIssueComments: z.boolean(),
	slackIssueStatuses: z.boolean(),
	teamIds: z.array(z.string().uuid()),
	// TODO(@alii): Find out this type
	memberIds: z.array(z.unknown()),
});

export const project = createAllStates(commons, defaultRemoveSchema).and(
	z.object({
		type: z.literal('Project'),
		url: z.string().url(),
	}),
);
