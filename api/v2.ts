import { LinearClient } from "@linear/sdk";
import { api, HttpException } from "nextkit";
import { z } from "zod";

// Linear's trusted ip range, this comes from
// https://developers.linear.app/docs/graphql/webhooks#how-does-a-webhook-work
const LINEAR_IP_RANGE = ["35.231.147.226", "35.243.134.228"];

const querySchema = z.object({
	api: z.string(),
	token: z.string(),
	id: z.string(),
});

const resourceTypes = ["Comment", "Issue", "IssueLabel", "Project", "Cycle", "Reaction"] as const;

export default api({
	async GET(req) {
		const ip = z.string().parse(req.headers["x-vercel-forwarded-for"]);

		if (!LINEAR_IP_RANGE.includes(ip)) {
			throw new HttpException(400, "This request came from an untrusted ip.");
		}

		const { token, id, api } = querySchema.parse(req.query);
		const client = new LinearClient({
			apiKey: api,
			headers: {
				"User-Agent": "github.com/alii/linear-discord-serverless",
			},
		});

		return { success: true };
	},
});
