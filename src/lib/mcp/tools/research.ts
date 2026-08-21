import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { researchImpl } from "@/lib/ai.server";

export default defineTool({
  name: "research_briefing",
  title: "Research briefing",
  description:
    "Produce a professional markdown briefing on a topic: executive summary, key insights, risks and next steps.",
  inputSchema: {
    topic: z.string().describe("The research question or topic."),
    depth: z.string().describe("How deep to go, e.g. quick overview, standard, deep dive."),
  },
  outputSchema: { briefing: z.string().describe("The markdown briefing.") },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ topic, depth }) => {
    const { briefing } = await researchImpl({ topic, depth });
    return { content: [{ type: "text", text: briefing }], structuredContent: { briefing } };
  },
});