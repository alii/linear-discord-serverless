import dayjs from 'dayjs';
import {AnyZodObject, z} from 'zod';

export const dateSchema = z
	.date()
	.or(z.string().transform(str => dayjs(str).toDate()));

export const enum Action {
	CREATE = 'create',
	UPDATE = 'update',
	REMOVE = 'remove',
}

export const defaultAction = z.enum([
	Action.CREATE,
	Action.UPDATE,
	Action.REMOVE,
]);

export const defaultRemoveSchema = z.object({archivedAt: dateSchema});

export const createAllStates = <T extends AnyZodObject, R extends AnyZodObject>(
	commons: T,
	removeState: R,
) => {
	return z
		.object({
			action: z.enum([Action.UPDATE, Action.CREATE]),
			data: commons,
		})
		.or(
			z.object({
				action: z.literal(Action.REMOVE),
				data: removeState.merge(commons),
			}),
		);
};
