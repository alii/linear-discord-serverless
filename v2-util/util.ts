import dayjs from 'dayjs';
import {z} from 'zod';

export const date = z
	.date()
	.or(z.string().transform(str => dayjs(str).toDate()));
