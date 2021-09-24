import {LinearClient} from '@linear/sdk';
import {MessageEmbed} from 'discord.js';
import {api, HttpException} from 'nextkit';
import {z} from 'zod';
import {bodySchema} from '../v2-util/schema';
import fetch from 'node-fetch';

const querySchema = z.object({
	api: z.string(),
	token: z.string(),
	id: z.string(),
});

const enum Colors {
	LINEAR_PURPLE = '#5864d9',
	ERRORS = '#d95858',
	SUCCESS = '#67d958',
	INFO = '#58c4d9',
	WARN = '#d9aa58',
}

const footer = '⚡️ powered by lds.alistair.cloud';

export default api({
	async POST(req) {
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

		const embed = new MessageEmbed().setColor(Colors.LINEAR_PURPLE);

		switch (body.type) {
			case 'Comment': {
				const author = await client.user(body.data.userId);

				embed
					.setTitle(`Comment ${body.action} by ${author.name}.`)
					.setDescription(body.data.body)
					.setTimestamp(body.data.updatedAt)
					.setFooter(footer)
					.setAuthor(author.name, author.avatarUrl);

				break;
			}

			default:
				throw new HttpException(
					400,
					`The resource type ${body.type} is not supported yet!`,
				);
		}

		const webhook = `https://discord.com/api/webhooks/${webhookId}/${webhookToken}`;

		await fetch(webhook, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				embeds: [embed.toJSON()],
			}),
		});
	},
});
