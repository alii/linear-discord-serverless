import {z} from 'zod';
import {date} from './util';

const data = z.object({
	id: z.string().uuid(),
	createdAt: date,
	updatedAt: date,
	name: z.string(),
	color: z.string(),
	teamId: z.string().uuid(),
	creatorId: z.string().uuid(),
});

export const issueLabel = z
	.object({
		data,
	})
	.or(
		z.object({
			action: z.literal('remove'),
			data: z
				.object({
					archivedAt: date,
				})
				.merge(data),
		}),
	)
	.and(z.object({type: z.literal('IssueLabel')}));
