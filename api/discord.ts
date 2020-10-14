import { NowRequest, NowResponse } from "@now/node";
import moment from "moment";
import fetch from "node-fetch";
import { MessageEmbed } from "discord.js";

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

  const body = req.body as IncomingLinearWebhookPayload;

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
    res.status(500).json({
      success: false,
      message: `Node.js runtime error: ${e.message}`,
    });
  }
}

async function sendIssue(
  payload: IncomingLinearWebhookPayload,
  webhook: { id: string; token: string }
) {
  const url = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}?wait=true`;

  const embed = new MessageEmbed()
    .addField("Status", payload.data.state.name, true)
    .setColor("#4752b2")
    .setAuthor(`Issue Created [${getId(payload.url)}]`)
    .setTitle(payload.data?.title ?? "No Title")
    .setURL(payload.url)
    .setDescription(payload.data.description ?? "")
    .setTimestamp()
    .setFooter(
      "Linear App",
      "https://pbs.twimg.com/profile_images/1121592030449168385/MF6whgy1_400x400.png"
    );

  if (payload.data.labels) {
    embed.addField("Labels", parseLabels(payload.data.labels || []), true);
  }

  if (payload.data.dueDate) {
    embed.addField("Due", moment(payload.data.dueDate).format("LLL"), true);
  }

  if (payload.data.estimate) {
    embed.addField("Points", `${payload.data.estimate} points`, true);
  }

  if (payload.data.estimate) {
    const value = getPriorityValue(payload.data.priority || 0);
    embed.addField("Priority", value, true);
  }

  const request = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [embed.toJSON()],
    }),
  });

  const response = await request.json();

  return {
    url,
    response,
    status: request.status,
  };
}
