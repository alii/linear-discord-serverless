import {LinearClient} from '@linear/sdk';
import {api, HttpException} from 'nextkit';
import {z, ZodError} from 'zod';
import {bodySchema} from '../v2-util/schema';

const querySchema = z.object({
	api: z.string(),
	token: z.string(),
	id: z.string(),
});

export default api(
	{
		async GET(req) {
			// Linear's trusted ip range, this comes from
			// https://developers.linear.app/docs/graphql/webhooks#how-does-a-webhook-work
			const {success} = z
				.enum(['35.231.147.226', '35.243.134.228'])
				.safeParse(req.headers['x-vercel-forwarded-for']);

			if (!success && process.env.NODE_ENV !== 'development') {
				throw new HttpException(400, 'sus');
			}

			const {
				token: webhookToken,
				id: webhookId,
				api,
			} = querySchema.parse(req.query);

			const client = new LinearClient({
				apiKey: api,
				headers: {'User-Agent': 'github.com/alii/linear-discord-serverless'},
			});

			const body = bodySchema.parse(req.body);

			return {success: true};
		},
	},
	e => {
		if (e instanceof Error) {
			if (e instanceof ZodError) {
				return console.log(
					e.issues.map(issue => `${issue.path} is ${issue.message}`).join(', '),
				);
			}

			console.log(e.message);
		}

		if (typeof e === 'string') {
			console.log(e);
		}
	},
);
