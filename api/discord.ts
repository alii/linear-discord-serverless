import { NowRequest, NowResponse } from '@now/node';
import fetch from 'node-fetch';

export default async function handler(req: NowRequest, res: NowResponse): Promise<void> {
  const { id, token } = req.query as {
    id: string;
    token: string;
  };

  const body = req.body as IncomingLinearWebhookPayload;

  if (body.action !== 'create' && body.type !== 'Issue') {
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
        fields: [
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
          {
            name: 'Labels',
            value: prettifyLabels(payload.data.labels || []),
            inline: false,
          },
        ],
        timestamp: new Date(),
        footer: {
          text: `Linear App`,
          icon_url: 'https://pbs.twimg.com/profile_images/1121592030449168385/MF6whgy1_400x400.png',
        },
      },
    ],
  };

  const body = JSON.stringify(embed);
  console.log({ body });

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

/**
 * Get the Priority Value translated
 * @param priority number for priority
 */
function getPriorityValue(priority: NonNullable<IncomingLinearWebhookPayload['data']['priority']>) {
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
  }
}

/**
 * Get the task ID from url
 * @param link task url
 */
function getId(link: string) {
  return link.split('/')[5];
}

/**
 * Formats and prettifies label(s)
 * @param labels connected labels
 */
function prettifyLabels(labels: NonNullable<IncomingLinearWebhookPayload['data']['labels']>) {
  return labels.map((label) => label.name).join(', ');
}

interface IncomingLinearWebhookPayload {
  action: 'create' | 'update' | 'remove';
  data: Data;
  type: string;
  createdAt: string;
  updatedFrom?: UpdatedFrom;
  url: string;
}

interface Data {
  id: string;
  title?: string;
  subscriberIds?: string[];
  previousIdentifiers?: any[];
  createdAt: string;
  updatedAt: string;
  archivedAt: any;
  number?: number;
  description?: string;
  documentVersion?: number;
  priority?: number;
  estimate: any;
  boardOrder?: number;
  startedAt: any;
  completedAt: any;
  canceledAt: any;
  autoClosedAt: any;
  autoArchivedAt: any;
  dueDate: any;
  labelIds?: string[];
  teamId?: string;
  cycleId?: string;
  projectId?: string;
  creatorId?: string;
  assigneeId?: string;
  stateId?: string;
  parentId: any;
  source?: string;
  priorityLabel?: string;
  labels?: Label[];
  team?: Team;
  state?: State;
  body?: string;
  edited?: boolean;
  issueId?: string;
  userId?: string;
}

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Team {
  id: string;
  name: string;
  key: string;
}

interface State {
  id: string;
  name: string;
  color: string;
  description: any;
  type: string;
}

interface UpdatedFrom {
  updatedAt: string;
  labelIds?: any[];
  priorityLabel: string;
  labels: any[];
  priority?: number;
}
