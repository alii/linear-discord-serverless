import { Root as IncomingLinearWebhookPayload } from "./_types";
import { MessageEmbed } from "discord.js";
import fetch from "node-fetch";
import moment from "moment";

export type StringPriority = "None" | "Urgent" | "High" | "Medium" | "Low";

/**
 * Get the Priority Value translated
 * @param priority number for priority
 */
export function getPriorityValue(
  priority: NonNullable<IncomingLinearWebhookPayload["data"]["priority"]>
): StringPriority {
  switch (priority) {
    case 0:
      return "None";
    case 1:
      return "Urgent";
    case 2:
      return "High";
    case 3:
      return "Medium";
    case 4:
      return "Low";
    default:
      return "None";
  }
}

/**
 * Get the task ID from url
 * @param link task url
 */
export function getId(link: string): string {
  return link.split("/")[5];
}

/**
 * Formats and prettifies label(s)
 * @param labels connected labels
 */
export function parseLabels(
  labels: NonNullable<IncomingLinearWebhookPayload["data"]["labels"]>
) {
  return labels.map((label) => label.name).join(", ");
}

/**
 * Finds all image URLs in some content
 * @param content The content to parse images from
 */
export function parseImages(
  content: string
): {
  images: string[];
  content: string;
} {
  return {
    images:
      content.match(/\b(https?:\/\/\S+(?:png|jpe?g|gif|webm)\S*)\b/g) || [],
    content: content.replace(/!\[/g, "["),
  };
}

export function error(message: string): MessageEmbed {
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

export function exec(url: string, embed: MessageEmbed) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [embed.toJSON()],
    }),
  });
}

export async function sendIssue(
  payload: Partial<IncomingLinearWebhookPayload>,
  webhook: { id: string; token: string }
) {
  const url = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}?wait=true`;

  if (!payload.data) {
    throw new Error("Issue data was not sent");
  }

  if (!payload.url) {
    throw new Error("Issue URL was not sent");
  }

  const type: "Update" | "Create" =
    payload.action === "create" ? "Create" : "Update";

  const embed = new MessageEmbed()
    .addField("Status", payload.data.state.name, true)
    .setColor(payload.data?.state?.color ?? "#4752b2")
    .setAuthor(`Issue ${type}d [${getId(payload.url)}]`)
    .setTitle(payload.data.title ?? "No Title")
    .setURL(payload.url)
    .setTimestamp()
    .setFooter(
      `Linear App • ${type}`,
      "https://pbs.twimg.com/profile_images/1121592030449168385/MF6whgy1_400x400.png"
    );

  if (payload.data.labels && payload.data.labels.length > 0) {
    embed.addField("Labels", parseLabels(payload.data.labels), true);
  }

  if (payload.data.dueDate) {
    try {
      const dueDate = moment(payload.data.dueDate, "YYYY-MM-DD", true);
      embed.addField("Due", dueDate.format("LLL"), true);
    } catch (e) {}
  }

  if (payload.data.estimate && !isNaN(payload.data.estimate)) {
    embed.addField("Estimate", `Level: ${payload.data.estimate}`, true);
  }

  if (payload.data.priority && !isNaN(payload.data.priority)) {
    const value = getPriorityValue(payload.data.priority || 0);
    embed.addField("Priority", value, true);
  }

  const { images, content } = parseImages(payload.data.description);

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
