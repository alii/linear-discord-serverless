import dayjs from 'dayjs';
import {z} from 'zod';

export const dateSchema = z
	.date()
	.or(z.string().transform(str => dayjs(str).toDate()));

export const enum Actions {
	CREATE = 'create',
	UPDATE = 'update',
	REMOVE = 'remove',
}

export const defaultAction = z.enum([
	Actions.CREATE,
	Actions.UPDATE,
	Actions.REMOVE,
]);
