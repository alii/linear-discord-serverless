import {z} from 'zod';
import {createAllStates, dateResolvable, defaultRemoveSchema} from './util';

const commons = z.object({
	id: z.string().uuid(),
	createdAt: dateResolvable,
	updatedAt: dateResolvable,
	number: z.number(),
	startsAt: dateResolvable,
	endsAt: dateResolvable,
	// TODO(@alii): Find types for these
	issueCountHistory: z.array(z.unknown()),
	completedIssueCountHistory: z.array(z.unknown()),
	scopeHistory: z.array(z.unknown()),
	completedScopeHistory: z.array(z.unknown()),
	teamId: z.string().uuid(),
	// TODO(@alii): Find types for this
	uncompletedIssuesUponCloseIds: z.array(z.unknown()),
});

export const cycle = createAllStates(commons, defaultRemoveSchema).and(
	z.object({type: z.literal('Cycle')}),
);
