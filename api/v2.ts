import {LinearClient} from '@linear/sdk';
import {MessageEmbed} from 'discord.js';
import {HttpException} from 'nextkit';
import {z} from 'zod';
import {bodySchema} from '../v2-util/schema';
import fetch from 'node-fetch';
import {Label} from '../v1-util/_types';
import {api} from '../v2-util/api';
import {getId} from '../v2-util/util';

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

const avatar = 'https://lds.alistair.cloud/linear.png';
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

		const embed = new MessageEmbed()
			.setColor(Colors.LINEAR_PURPLE)
			.setFooter(footer, avatar)
			.setTimestamp(body.data.updatedAt);

		switch (body.type) {
			case 'Comment': {
				const author = await client.user(body.data.userId);
				const comment = await client.comment(body.data.id);

				embed
					.setTitle(`Comment ${body.action}d by ${author.name}.`)
					.setDescription(body.data.body)
					.setURL(comment.url)
					.setAuthor(author.name, author.avatarUrl);

				break;
			}

			case 'Issue': {
				embed
					.setTitle(`Issue ${body.action}d [${getId(body.url)}]`)
					.setURL(body.url)
					.setColor(body.data.state.color)
					.setDescription(body.data.description)
					.addField(
						'Labels',
						// Have to specify type here because Zod is too recursive for TypeScript to be able to infer
						// the correct type for each item in the array. idk how to fix this 🤣
						body.data.labels.map((label: Label) => label.name).join(', '),
						true,
					)
					.addField('State', body.data.state.name, true);

				break;
			}

			case 'Reaction': {
				const comment = await client.comment(body.data.commentId);

				embed
					.setTitle(`Reaction ${body.action}d by ${body.data.user.name}.`)
					.setURL(comment.url)
					.addField('Comment', `[Click Here](${comment.url})`, true)
					.addField('Emoji', `:${body.data.emoji}:`, true);

				break;
			}

			case 'Cycle': {
				const team = await client.team(body.data.teamId);
				const cycle = await client.cycle(body.data.id);

				const issues =
					cycle.issueCountHistory[cycle.issueCountHistory.length - 1];

				const completed =
					cycle.completedIssueCountHistory[
						cycle.completedIssueCountHistory.length - 1
					];

				embed
					.setTitle(`Cycle ${body.action}d for team ${team.name}`)
					.addField('Starts', body.data.startsAt.format('YYYY-MM-dd'), true)
					.addField('Ends', body.data.endsAt.format('YYYY-MM-dd'), true)
					.addField('Issues', issues.toString())
					.addField('Completed Issues', completed.toString(), true);

				if (team.description) {
					embed.setDescription(team.description);
				}

				break;
			}

			// case 'IssueLabel': {
			// 	break;
			// }

			// case 'Project': {
			// 	break;
			// }

			default: {
				throw new HttpException(
					400,
					`The resource type ${body.type} is not supported yet!`,
				);
			}
		}

		const webhook = `https://discord.com/api/webhooks/${webhookId}/${webhookToken}`;

		await fetch(webhook, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				embeds: [embed.toJSON()],
				avatar_url: avatar,
			}),
		});
	},
});
