import {z} from 'zod';

export const cycle = z.object({
	type: z.literal('Cycle'),
});
