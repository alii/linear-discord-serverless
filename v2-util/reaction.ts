import {z} from 'zod';

export const reaction = z.object({
	type: z.literal('Reaction'),
});
