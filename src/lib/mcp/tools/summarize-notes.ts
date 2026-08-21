import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { summarizeNotesImpl } from "@/lib/ai.server";

export default defineTool({
  name: "summarize_meeting_notes",
  title: "Summarize meeting notes",
  description:
    "Turn raw meeting notes or a transcript into a summary, key points, owned action items and deadlines.",
  inputSchema: {
    notes: z.string().describe("Raw meeting notes or transcript text."),
  },
  outputSchema: {
    summary: z.string(),
    keyPoints: z.array(z.string()),
    actionItems: z.array(
      z.object({
        task: z.string(),
        owner: z.string(),
        priority: z.enum(["high", "medium", "low"]),
      }),
    ),
    deadlines: z.array(z.object({ item: z.string(), due: z.string() })),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ notes }) => {
    const summary = await summarizeNotesImpl({ notes });
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});