import { NowRequest, NowResponse } from "@now/node";
import moment from "moment";
import fetch from "node-fetch";
import { Message, MessageEmbed } from "discord.js";

import { Root as IncomingLinearWebhookPayload } from "./_types";
import { getId, getPriorityValue, parseLabels } from "./_util";

export default async function handler(
  req: NowRequest,
  res: NowResponse
): Promise<void> {
  const { id, token } = req.query as {
    id: string;
    token: string;
  };

  const body = req.body as Partial<IncomingLinearWebhookPayload>;

  if (body.action !== "create" || body.type !== "Issue") {
    res.json({
      success: false,
      message: "This is for creation of issues only!",
    });

    return;
  }

  try {
    const response = await sendIssue(body, { id, token });
    console.table({ ...response, id, token });

    res.json({
      success: true,
      message: "Success, webhook has been sent.",
    });
  } catch (e) {
    const url = `https://discord.com/api/webhooks/${id}/${token}?wait=true`;
    await exec(url, error(e.message));

    res.status(500).json({
      success: false,
      message: `Node.js runtime error: ${e.message}`,
    });
  }
}

function error(message: string): MessageEmbed {
  return new MessageEmbed()
    .setTitle("Something went wrong")
    .setDescription(message)
    .setColor("#ff6363")
    .setFooter(
      "Linear App",
      "https://pbs.twimg.com/profile_images/1121592030449168385/MF6whgy1_400x400.png"
    )
    .setTimestamp()
    .setAuthor(
      "Uh oh...",
      "https://cdn.icon-icons.com/icons2/1380/PNG/512/vcsconflicting_93497.png"
    );
}

function exec(url: string, embed: MessageEmbed) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [embed.toJSON()],
    }),
  });
}

async function sendIssue(
  payload: Partial<IncomingLinearWebhookPayload>,
  webhook: { id: string; token: string }
) {
  const url = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}?wait=true`;

  if (!payload.data) {
    await exec(url, error("Issue data was not sent"));
    return;
  }

  if (!payload.url) {
    await exec(url, error("Issue URL was not sent"));
    return;
  }

  const embed = new MessageEmbed()
    .addField("Status", payload.data.state.name, true)
    .setColor("#4752b2")
    .setAuthor(`Issue Created [${getId(payload.url)}]`)
    .setTitle(payload.data.title ?? "No Title")
    .setURL(payload.url)
    .setDescription(payload.data.description ?? "")
    .setTimestamp()
    .setFooter(
      "Linear App",
      "https://pbs.twimg.com/profile_images/1121592030449168385/MF6whgy1_400x400.png"
    );

  if (payload.data.labels && payload.data.labels.length > 0) {
    embed.addField("Labels", parseLabels(payload.data.labels || []), true);
  }

  if (payload.data.dueDate && moment.isDate(payload.data.dueDate)) {
    embed.addField("Due", moment(payload.data.dueDate).format("LLL"), true);
  }

  if (payload.data.estimate && !isNaN(payload.data.estimate)) {
    embed.addField("Points", `${payload.data.estimate} points`, true);
  }

  if (payload.data.priority && !isNaN(payload.data.priority)) {
    const value = getPriorityValue(payload.data.priority || 0);
    embed.addField("Priority", value, true);
  }

  const request = await exec(url, embed);

  const response = await request.json();

  return {
    url,
    response,
    status: request.status,
  };
}
