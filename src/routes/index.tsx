import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, Compass, MessageSquare, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";

const title = "Dashboard — AI Workplace Productivity Assistant";
const description =
  "Automate daily work: draft emails by tone and audience, summarize meeting notes, plan and prioritize tasks, and research topics with AI.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    url: "/email",
    icon: Mail,
    name: "Smart Email Generator",
    blurb: "Draft a send-ready email calibrated to a specific tone and audience.",
    meta: "Tone · Audience · Length",
  },
  {
    url: "/summarizer",
    icon: FileText,
    name: "Meeting Notes Summarizer",
    blurb: "Turn raw notes into key points, owned action items, and deadlines.",
    meta: "Key points · Actions · Deadlines",
  },
  {
    url: "/planner",
    icon: ListChecks,
    name: "AI Task Planner",
    blurb: "Prioritize a messy work list and schedule it inside your working window.",
    meta: "P0–P2 · Time blocks",
  },
  {
    url: "/research",
    icon: Compass,
    name: "AI Research Assistant",
    blurb: "Get a structured briefing with insights, risks, and next steps.",
    meta: "Insights · Risks · Actions",
  },
  {
    url: "/chat",
    icon: MessageSquare,
    name: "Assistant Chat",
    blurb: "Ask follow-ups and work through anything in a running conversation.",
    meta: "Conversational",
  },
] as const;

const stats = [
  { label: "Workflows available", value: "5", note: "Email, notes, planning, research, chat" },
  { label: "Prompt engineering", value: "Structured", note: "Role, rules, and output contract" },
  { label: "Data retention", value: "None", note: "Nothing is stored between sessions" },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Your AI workspace"
        description="Five focused assistants for the work that fills your day. Pick a workflow, give it context, and review the output before you use it."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card">
            <p className="label-eyebrow">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Workflows</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map((t) => (
            <Link
              key={t.url}
              to={t.url}
              className="group rounded-xl border bg-card p-5 shadow-card transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <div className="flex items-start gap-4">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent">
                  <t.icon className="size-4 text-accent-foreground" aria-hidden />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{t.name}</h3>
                    <ArrowRight
                      className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>
                  <p className="mt-3 font-mono text-[11px] text-muted-foreground">{t.meta}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <AiDisclaimer />
    </div>
  );
}
