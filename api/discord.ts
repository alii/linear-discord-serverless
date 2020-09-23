import { NowRequest, NowResponse } from '@now/node';
import moment from 'moment';
import fetch from 'node-fetch';
import { Field as DiscordField, IncomingLinearWebhookPayload } from './_types';
import { getId, getPriorityValue, parseLabels } from './_util';

export default async function handler(req: NowRequest, res: NowResponse): Promise<void> {
  const { id, token } = req.query as {
    id: string;
    token: string;
  };

  const body = req.body as IncomingLinearWebhookPayload;

  if (body.action !== 'create' || body.type !== 'Issue') {
    res.json({
      success: false,
      message: 'This is for creation of issues only!',
    });

    return;
  }

  try {
    await sendIssue(body, { id, token });

    res.json({
      success: true,
      message: 'Success, webhook has been sent.',
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: `Node.js runtime error: ${e.message}`,
    });
  }
}

function sendIssue(payload: IncomingLinearWebhookPayload, webhook: { id: string; token: string }) {
  const url = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`;

  const fields: DiscordField[] = [
    {
      name: 'Priority',
      value: getPriorityValue(payload.data.priority || 0),
      inline: true,
    },
    {
      name: 'Status',
      value: payload.data.state.name,
      inline: true,
    },
  ];

  if (payload.data.labels) {
    fields.push({
      name: 'Labels',
      value: parseLabels(payload.data.labels || []),
      inline: true,
    });
  }

  // TODO: Add assignee integration

  if (payload.data.dueDate) {
    fields.push({
      name: 'Due',
      value: moment(payload.data.dueDate).format('LLL'),
      inline: true,
    });
  }

  if (payload.data.estimate) {
    fields.push({
      name: 'Points',
      value: `${payload.data.estimate} points`,
    });
  }

  const embed = {
    embeds: [
      {
        color: 0x4752b2,
        author: {
          name: `Issue Created [${getId(payload.url)}]`,
        },
        title: payload.data.title,
        url: payload.url,
        description: payload.data.description || '',
        fields,
        timestamp: new Date(),
        footer: {
          text: `Linear App`,
          icon_url: 'https://pbs.twimg.com/profile_images/1121592030449168385/MF6whgy1_400x400.png',
        },
      },
    ],
  };

  const body = JSON.stringify(embed);

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}
