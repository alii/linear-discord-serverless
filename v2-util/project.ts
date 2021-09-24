import {z} from 'zod';

export const project = z.object({
	type: z.literal('Project'),
});
