import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { planTasksImpl } from "@/lib/ai.server";

export default defineTool({
  name: "plan_tasks",
  title: "Prioritize and schedule tasks",
  description:
    "Turn a messy list of work into P0-P2 prioritized tasks with estimates and time blocks inside a working window.",
  inputSchema: {
    tasks: z.string().describe("The raw list of work items, one per line."),
    workingHours: z.string().describe("Working window, e.g. '09:00 - 17:00'."),
  },
  outputSchema: {
    focusNote: z.string(),
    tasks: z.array(
      z.object({
        title: z.string(),
        rationale: z.string(),
        priority: z.enum(["P0", "P1", "P2"]),
        estimatedMinutes: z.number(),
        scheduled: z.string(),
      }),
    ),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ tasks, workingHours }) => {
    const plan = await planTasksImpl({ tasks, workingHours });
    return {
      content: [{ type: "text", text: JSON.stringify(plan, null, 2) }],
      structuredContent: plan,
    };
  },
});