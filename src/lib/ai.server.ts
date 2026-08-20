import { Output, streamText } from "ai";
import { z } from "zod";
import { AI_MODEL, createLovableAiGatewayProvider, requireGatewayKey } from "./ai-gateway.server";
import {
  CHAT_SYSTEM,
  EMAIL_SYSTEM,
  PLANNER_SYSTEM,
  RESEARCH_SYSTEM,
  SUMMARY_SYSTEM,
} from "./ai-prompts";

function model() {
  return createLovableAiGatewayProvider(requireGatewayKey())(AI_MODEL);
}

async function text(system: string, prompt: string) {
  const result = streamText({ model: model(), system, prompt });
  return await result.text;
}

export async function generateEmailImpl(data: {
  context: string;
  tone: string;
  audience: string;
  length: string;
}) {
  const email = await text(
    EMAIL_SYSTEM,
    [
      `TONE: ${data.tone}`,
      `AUDIENCE: ${data.audience}`,
      `LENGTH: ${data.length}`,
      `CONTEXT:\n${data.context}`,
    ].join("\n"),
  );
  return { email };
}

const SummarySchema = z.object({
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
});

export type MeetingSummary = z.infer<typeof SummarySchema>;

export async function summarizeNotesImpl(data: { notes: string }) {
  const result = streamText({
    model: model(),
    system: SUMMARY_SYSTEM,
    prompt: `MEETING NOTES:\n${data.notes}`,
    output: Output.object({ schema: SummarySchema }),
  });
  return (await result.output) as MeetingSummary;
}

const PlanSchema = z.object({
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
});

export type TaskPlan = z.infer<typeof PlanSchema>;

export async function planTasksImpl(data: { tasks: string; workingHours: string }) {
  const result = streamText({
    model: model(),
    system: PLANNER_SYSTEM,
    prompt: `WORKING WINDOW: ${data.workingHours}\n\nRAW WORK ITEMS:\n${data.tasks}`,
    output: Output.object({ schema: PlanSchema }),
  });
  return (await result.output) as TaskPlan;
}

export async function researchImpl(data: { topic: string; depth: string }) {
  const briefing = await text(
    RESEARCH_SYSTEM,
    `DEPTH: ${data.depth}\n\nRESEARCH QUESTION:\n${data.topic}`,
  );
  return { briefing };
}

export async function chatImpl(data: {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  const result = streamText({
    model: model(),
    system: CHAT_SYSTEM,
    messages: data.messages,
  });
  return { reply: await result.text };
}