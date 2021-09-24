import {LinearClient} from '@linear/sdk';
import {api, HttpException} from 'nextkit';
import {z} from 'zod';

const querySchema = z.object({
	api: z.string(),
	token: z.string(),
	id: z.string(),
});

export default api({
	async GET(req) {
		// Linear's trusted ip range, this comes from
		// https://developers.linear.app/docs/graphql/webhooks#how-does-a-webhook-work
		const ip = z
			.enum(['35.231.147.226', '35.243.134.228'])
			.safeParse(req.headers['x-vercel-forwarded-for']);

		if (!ip.success) {
			throw new HttpException(400, 'This request came from an untrusted ip.');
		}

		const query = querySchema.safeParse(req.query);

		if (!query.success) {
			throw new HttpException(400, 'You are missing query parameters!');
		}

		const {token, id, api} = query.data;

		const client = new LinearClient({
			apiKey: api,
			headers: {'User-Agent': 'github.com/alii/linear-discord-serverless'},
		});

		return {success: true};
	},
});
