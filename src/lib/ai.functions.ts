import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  generateEmailImpl,
  summarizeNotesImpl,
  planTasksImpl,
  researchImpl,
  chatImpl,
} from "./ai.server";

const EmailInput = z.object({
  context: z.string().min(1),
  tone: z.string().min(1),
  audience: z.string().min(1),
  length: z.string().min(1),
});

const NotesInput = z.object({ notes: z.string().min(1) });

const PlannerInput = z.object({
  tasks: z.string().min(1),
  workingHours: z.string().min(1),
});

const ResearchInput = z.object({
  topic: z.string().min(1),
  depth: z.string().min(1),
});

const ChatInput = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .min(1),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => generateEmailImpl(data));

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => NotesInput.parse(input))
  .handler(async ({ data }) => summarizeNotesImpl(data));

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlannerInput.parse(input))
  .handler(async ({ data }) => planTasksImpl(data));

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => researchImpl(data));

export const sendChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => chatImpl(data));