import { NowRequest, NowResponse } from "@now/node";

import { Root as IncomingLinearWebhookPayload } from "./_types";
import { error, exec, sendIssue } from "./_util";

export default async function handler(
  req: NowRequest,
  res: NowResponse
): Promise<void> {
  if (!req.method || req.method.toUpperCase() !== "POST") {
    return void res.status(405).json({
      success: false,
      message: `Cannot ${req.method} this endpoint. Must be POST`,
    });
  }

  const { id, token } = req.query as {
    id: string;
    token: string;
  };

  const body = req.body as Partial<IncomingLinearWebhookPayload> | undefined;

  if (!body || !body.type || !body.action || !body.data) {
    return void res.status(422).json({
      success: false,
      message: "No body sent",
    });
  }

  const isIssue = body.type === "Issue";
  const isCreateOrUpdate = ["create", "update"].includes(body.action);

  if (!isCreateOrUpdate || !isIssue) {
    return void res.json({
      success: false,
      message: "This is for creation or update of issues only!",
    });
  }

  try {
    await sendIssue(body, { id, token });

    return void res.json({
      success: true,
      message: "Success, webhook has been sent.",
    });
  } catch (e) {
    const url = `https://discord.com/api/webhooks/${id}/${token}`;
    await exec(url, error(e.message));

    return void res.status(500).json({
      success: false,
      message: `Something went wrong: ${e.message}`,
    });
  }
}
