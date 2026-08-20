import { defineMcp } from "@lovable.dev/mcp-js";
import generateEmailTool from "./tools/generate-email";
import summarizeNotesTool from "./tools/summarize-notes";
import planTasksTool from "./tools/plan-tasks";
import researchTool from "./tools/research";

export default defineMcp({
  name: "ai-productivity-hub",
  title: "AI Productivity Hub",
  version: "0.1.0",
  instructions:
    "Workplace productivity tools. Use `generate_email` to draft business email, `summarize_meeting_notes` to extract key points, actions and deadlines from notes, `plan_tasks` to prioritize and schedule a list of work, and `research_briefing` for a structured briefing on a topic.",
  tools: [generateEmailTool, summarizeNotesTool, planTasksTool, researchTool],
});