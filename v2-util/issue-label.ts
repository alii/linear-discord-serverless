import {z} from 'zod';
import {createAllStates, dateResolvable, defaultRemoveSchema} from './util';

const commons = z.object({
	id: z.string().uuid(),
	createdAt: dateResolvable,
	updatedAt: dateResolvable,
	name: z.string(),
	color: z.string(),
	teamId: z.string().uuid(),
	creatorId: z.string().uuid(),
});

export const issueLabel = createAllStates(commons, defaultRemoveSchema).and(
	z.object({
		type: z.literal('IssueLabel'),
	}),
);
