import {z} from 'zod';
import {Actions, dateSchema} from './util';

const commons = z.object({
	id: z.string().uuid(),
	createdAt: dateSchema,
	updatedAt: dateSchema,
	name: z.string(),
	color: z.string(),
	teamId: z.string().uuid(),
	creatorId: z.string().uuid(),
});

const removeState = z.object({
	action: z.literal(Actions.REMOVE),
	data: z.object({archivedAt: dateSchema}).merge(commons),
});

const updateOrCreateState = z.object({
	action: z.enum([Actions.CREATE, Actions.UPDATE]),
	data: commons,
});

export const issueLabel = updateOrCreateState.or(removeState).and(
	z.object({
		type: z.literal('IssueLabel'),
	}),
);
