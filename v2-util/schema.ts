import {z} from 'zod';
import {comment} from './comment';

import {cycle} from './cycle';
import {issue} from './issue';
import {issueLabel} from './issue-label';
import {project} from './project';
import {reaction} from './reaction';
import {date} from './util';

const commons = z.object({
	action: z.enum(['create', 'update', 'remove']),
	organizationId: z.string().uuid(),
	createdAt: date,
});

export const bodySchema = comment
	.or(issue)
	.or(issueLabel)
	.or(project)
	.or(cycle)
	.or(reaction)
	.and(commons);

const result = bodySchema.parse({});
