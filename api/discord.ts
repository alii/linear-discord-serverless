import {VercelRequest, VercelResponse} from '@vercel/node';

import {RequestBody as IncomingLinearWebhookPayload} from '../v1-util/_types';
import {error, exec, sendComment, sendIssue} from '../v1-util/_util';

export default async function handler(
	req: VercelRequest,
	res: VercelResponse,
): Promise<void> {
	if (!req.method || req.method.toUpperCase() !== 'POST') {
		return void res.status(405).json({
			success: false,
			message: `Cannot ${req.method} this endpoint. Must be POST`,
		});
	}

	const {id, token} = req.query as {
		id: string;
		token: string;
	};

	const body = req.body as Partial<IncomingLinearWebhookPayload> | undefined;

	if (!body || !body.type || !body.action || !body.data) {
		return void res.status(422).json({
			success: false,
			message: 'No body sent',
		});
	}

	if (!['create', 'update'].includes(body.action)) {
		return void res.json({
			success: false,
			message: 'This is for creation or update of issues only!',
		});
	}

	if (!body.url) {
		return void res.json({
			success: false,
			message: 'No Issue URL was sent',
		});
	}

	const options = [
		{action: body.action, url: body.url},
		{id, token},
	] as const;

	try {
		if (body.type === 'Issue') {
			await sendIssue(body.data, ...options);
		} else if (body.type === 'Comment') {
			await sendComment(body.data, ...options);
		} else {
			return void res.json({
				success: false,
				message: 'You ',
			});
		}

		return void res.json({
			success: true,
			message: 'Success, webhook has been sent.',
		});
	} catch (e) {
		const url = `https://discord.com/api/webhooks/${id}/${token}`;
		await exec(
			url,
			error(e instanceof Error ? e.message : 'something went wrong'),
		);

		return void res.status(500).json({
			success: false,
			message: `Something went wrong: ${
				e instanceof Error ? e.message : 'unknown errors'
			}`,
		});
	}
}
