import {z} from 'zod';
import {dateResolvable} from './util';

export const comment = z.object({
	type: z.literal('Comment'),
	url: z.string().url(),
	data: z.object({
		id: z.string().uuid(),
		createdAt: dateResolvable,
		updatedAt: dateResolvable,
		body: z.string(),
		userId: z.string().uuid(),
		issueId: z.string().uuid(),
		issue: z.object({
			id: z.string().uuid(),
			title: z.string(),
		}),
		user: z.object({
			id: z.string().uuid(),
			name: z.string(),
		}),
	}),
});
