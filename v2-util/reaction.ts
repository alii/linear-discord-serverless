import {z} from 'zod';
import {createAllStates, dateSchema, defaultRemoveSchema} from './util';

const commons = z.object({
	id: z.string().uuid(),
	createdAt: dateSchema,
	updatedAt: dateSchema,
	emoji: z.string(),
	userId: z.string().uuid(),
	commentId: z.string().uuid(),
	comment: z.object({
		id: z.string().uuid(),
		body: z.string(),
		userId: z.string().uuid(),
	}),
	user: z.object({
		id: z.string().uuid(),
		name: z.string(),
	}),
});

export const reaction = createAllStates(commons, defaultRemoveSchema).and(
	z.object({
		type: z.literal('Reaction'),
	}),
);
