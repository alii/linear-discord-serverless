import dayjs from 'dayjs';
import {AnyZodObject, z} from 'zod';

/**
 * Get the issue ID from url
 * @param link issue url
 */
export function getId(link: string): string {
	return link.split('/')[5].split('#')[0];
}

/**
 * Schema for a value that could be resolved into a date
 */
export const dateResolvable = z
	.date()
	.or(z.string())
	.transform(value => dayjs(value));

/**
 * Payload actions to discriminate between types
 */
export const enum Action {
	CREATE = 'create',
	UPDATE = 'update',
	REMOVE = 'remove',
}

/**
 * A default action enum to be overriden by invidiaul schemas
 * @warning this does not allow for any type discrimination
 */
export const defaultAction = z.enum([
	Action.CREATE,
	Action.UPDATE,
	Action.REMOVE,
]);

/**
 * Most Action.REMOVE payloads will have a .archivedAt which should be a dateResolvable.
 * This is a schema that defines that
 */
export const defaultRemoveSchema = z.object({archivedAt: dateResolvable});

/**
 * Combines create, update and remove states into a single schema
 * @param commons Common shared properties between states
 * @param removeState Extra properties that only exist in an Action.REMOVE payload
 * @returns
 */
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
