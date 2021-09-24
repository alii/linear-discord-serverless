import {z, ZodSchema} from 'zod';
import day from 'dayjs';

const date = z.date().or(z.string().transform(str => day(str).toDate()));

export const bodySchema = z
	.object({
		type: z.literal('Comment'),
	})
	.or(
		z.object({
			type: z.literal('Issue'),
			url: z.string().url(),
			id: z.string().uuid(),
			createdAt: date,
			updatedAt: date,
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
			createdAt: date,
		}),
	);
