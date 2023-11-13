import {Comment, Issue, Action} from './_types';
import {MessageEmbed} from 'discord.js';
import fetch from 'node-fetch';
import moment from 'moment';

export type StringPriority = 'None' | 'Urgent' | 'High' | 'Medium' | 'Low';

/**
 * Get the Priority Value translated
 * @param priority number for priority
 */
export function getPriorityValue(
	priority: NonNullable<Issue['priority']>,
): StringPriority {
	switch (priority) {
		case 0:
			return 'None';
		case 1:
			return 'Urgent';
		case 2:
			return 'High';
		case 3:
			return 'Medium';
		case 4:
			return 'Low';
		default:
			return 'None';
	}
}

/**
 * Get the task ID from url
 * @param link task url
 */
export function getId(link: string): string {
	return link.split('/')[5].split('#')[0];
}

/**
 * Formats and prettifies label(s)
 * @param labels connected labels
 */
export function parseLabels(labels: NonNullable<Issue['labels']>) {
	return labels.map(label => label.name).join(', ');
}

/**
 * Finds all image URLs in some content
 * @param content The content to parse images from
 */
export function parseImages(content: string): {
	images: string[];
	content: string;
} {
	if (content.trim() === '') {
		return {images: [], content};
	}

	return {
		images:
			content.match(/\b(https?:\/\/\S+(?:png|jpe?g|gif|webm)\S*)\b/g) || [],
		content: content.replace(/!\[/g, '['),
	};
}

export function error(message: string): MessageEmbed {
	return new MessageEmbed()
		.setTitle('Something went wrong')
		.setDescription(message)
		.setColor('#ff6363')
		.setFooter(
			'Linear',
			'https://lds.alistair.cloud/linear-full.jpeg',
		)
		.setTimestamp()
		.setAuthor(
			'Uh oh...',
			'https://cdn.icon-icons.com/icons2/1380/PNG/512/vcsconflicting_93497.png',
		);
}

export function exec(url: string, embed: MessageEmbed) {
	return fetch(url, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			embeds: [embed.toJSON()],
		}),
	});
}

export async function sendComment(
	payload: Comment,
	metadata: {action: Action; url: string},
	webhook: {id: String; token: String},
) {
	const url = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}?wait=true`;

	const type: 'Update' | 'Create' =
		metadata.action === 'create' ? 'Create' : 'Update';

	const embed = new MessageEmbed()
		.setDescription(payload.body)
		.setColor('#4752b2')
		.setAuthor(`Comment ${type}d [${getId(metadata.url)}]`)
		.setTitle('A comment was added')
		.setURL(metadata.url)
		.addField('Edited', payload.edited ? 'Yes' : 'No', true)
		.setTimestamp(moment(payload.createdAt).toDate())
		.setFooter(
			`Linear • ${type}`,
			'https://lds.alistair.cloud/linear-full.jpeg',
		);

	const request = await exec(url, embed);

	if (request.status !== 200) {
		throw new Error(`Could not send message to discord. \`${request.status}\``);
	}

	const response = await request.json();

	return {
		url,
		response,
		status: request.status,
	};
}

export async function sendIssue(
	payload: Partial<Issue>,
	metadata: {action: Action; url: string},
	webhook: {id: string; token: string},
) {
	const url = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}?wait=true`;

	const type: 'Update' | 'Create' =
		metadata.action === 'create' ? 'Create' : 'Update';

	const embed = new MessageEmbed()
		.addField('Status', payload.state?.name ?? 'Backlog', true)
		.setColor(payload?.state?.color ?? '#4752b2')
		.setAuthor(`Issue ${type}d [${getId(metadata.url)}]`)
		.setTitle(payload.title ?? 'No Title')
		.setURL(metadata.url)
		.setTimestamp()
		.setFooter(
			`Linear • ${type}`,
			'https://lds.alistair.cloud/linear-full.jpeg',
		);

	if (payload.labels && payload.labels.length > 0) {
		embed.addField('Labels', parseLabels(payload.labels), true);
	}

	if (payload.dueDate) {
		try {
			const dueDate = moment(payload.dueDate, 'YYYY-MM-DD', true);
			embed.addField('Due', dueDate.format('LLL'), true);
		} catch (e) {}
	}

	if (payload.estimate && !isNaN(payload.estimate)) {
		embed.addField('Estimate', `Level: ${payload.estimate}`, true);
	}

	if (payload.priority && !isNaN(payload.priority)) {
		const value = getPriorityValue(payload.priority || 0);
		embed.addField('Priority', value, true);
	}

	const {images, content} = parseImages(payload.description || '');

	embed.setDescription(content);

	if (images.length) {
		embed.setImage(images[0]);
	}

	const request = await exec(url, embed);

	if (request.status !== 200) {
		throw new Error(`Could not send message to discord. \`${request.status}\``);
	}

	const response = await request.json();

	return {
		url,
		response,
		status: request.status,
	};
}
