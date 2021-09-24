import {z} from 'zod';
import {date} from './util';

export const comment = z.object({
	type: z.literal('Comment'),
	data: z.object({
		id: z.string().uuid(),
		createdAt: date,
		updatedAt: date,
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
