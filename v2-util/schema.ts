import {z} from 'zod';
import day from 'dayjs';

const schema = z
	.object({
		type: z.literal('Comment'),
	})
	.or(
		z.object({
			type: z.literal('Issue'),
			url: z.string().url(),
		}),
	)
	.or(
		z.object({
			type: z.literal('IssueLabel'),
		}),
	)
	.or(
		z.object({
			type: z.literal('Project'),
		}),
	)
	.or(
		z.object({
			type: z.literal('Cycle'),
		}),
	)
	.or(
		z.object({
			type: z.literal('Reaction'),
		}),
	)
	.and(
		z.object({
			action: z.enum(['create', 'update', 'remove']),
			organizationId: z.string().uuid(),
			createdAt: z.date().or(z.string().transform(str => day(str).toDate())),
		}),
	);
