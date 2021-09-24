import { z } from "zod";

const schema = z
	.object({
		type: z.literal("Comment"),
	})
	.or(
		z.object({
			type: z.literal("Issue"),
		})
	)
	.or(
		z.object({
			type: z.literal("IssueLabel"),
		})
	)
	.or(
		z.object({
			type: z.literal("Project"),
		})
	)
	.or(
		z.object({
			type: z.literal("Cycle"),
		})
	)
	.or(
		z.object({
			type: z.literal("Reaction"),
		})
	)
	.and(z.object({ action: z.enum(["create", "update", "remove"]) }));
