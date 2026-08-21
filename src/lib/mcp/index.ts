import { auth, defineMcp } from "@lovable.dev/mcp-js";
import generateEmailTool from "./tools/generate-email";
import summarizeNotesTool from "./tools/summarize-notes";
import planTasksTool from "./tools/plan-tasks";
import researchTool from "./tools/research";

// The OAuth issuer must be the direct Supabase auth host; the project ref is the
// only value that survives publish unchanged.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "ai-productivity-hub",
  title: "AI Productivity Hub",
  version: "0.1.0",
  instructions:
    "Workplace productivity tools. Use `generate_email` to draft business email, `summarize_meeting_notes` to extract key points, actions and deadlines from notes, `plan_tasks` to prioritize and schedule a list of work, and `research_briefing` for a structured briefing on a topic.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [generateEmailTool, summarizeNotesTool, planTasksTool, researchTool],
});
