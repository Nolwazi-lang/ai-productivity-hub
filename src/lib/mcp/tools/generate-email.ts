import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { generateEmailImpl } from "@/lib/ai.server";

export default defineTool({
  name: "generate_email",
  title: "Generate business email",
  description:
    "Draft a ready-to-send business email from raw context, calibrated to a tone, audience and length.",
  inputSchema: {
    context: z.string().describe("What the email needs to say, plus any relevant background."),
    tone: z.string().describe("Desired tone, e.g. formal, friendly, direct, apologetic."),
    audience: z.string().describe("Who receives it, e.g. executive team, client, direct report."),
    length: z.string().describe("Desired length, e.g. short, medium, detailed."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ context, tone, audience, length }) => {
    const { email } = await generateEmailImpl({ context, tone, audience, length });
    return { content: [{ type: "text", text: email }], structuredContent: { email } };
  },
});