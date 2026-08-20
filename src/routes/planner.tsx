import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Clock, Target } from "lucide-react";
import { toast } from "sonner";
import { planTasks } from "@/lib/ai.functions";
import { PageHeader } from "@/components/page-header";
import { OutputPanel } from "@/components/output-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const title = "AI Task Planner — AI Workplace Assistant";
const description =
  "Prioritize a messy list of work into P0–P2 tasks and schedule them inside your working window.";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: PlannerPage,
});

const priorityTone: Record<string, string> = {
  P0: "border-danger/30 bg-danger/10 text-danger",
  P1: "border-warning/30 bg-warning/10 text-warning",
  P2: "border-border bg-muted text-muted-foreground",
};

function PlannerPage() {
  const [tasks, setTasks] = useState("");
  const [workingHours, setWorkingHours] = useState("09:00 - 17:00");
  const fn = useServerFn(planTasks);
  const mutation = useMutation({
    mutationFn: (input: { tasks: string; workingHours: string }) => fn({ data: input }),
  });
  const plan = mutation.data;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Planning"
        title="AI Task Planner"
        description="Dump everything on your plate. The assistant ranks it by urgency and impact, then lays it out as time blocks across your working window."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <form
          className="space-y-5 rounded-xl border bg-card p-5 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (!tasks.trim()) {
              toast.error("List at least one task.");
              return;
            }
            mutation.mutate({ tasks, workingHours });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="tasks">Everything on your plate</Label>
            <Textarea
              id="tasks"
              rows={12}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={
                "Approve Q4 marketing spend (board asks for it today)\nReview the engineering hiring deck\n30-min sync with the design lead\nWrite the monthly stakeholder update\nRespond to the vendor audit email"
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours">Working window</Label>
            <Input
              id="hours"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              placeholder="09:00 - 17:00"
            />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Building plan…" : "Prioritize & schedule"}
          </Button>
        </form>

        <OutputPanel
          title="Prioritized schedule"
          isLoading={mutation.isPending}
          isEmpty={!plan}
          error={mutation.error ? "The plan could not be generated. Please try again." : null}
          emptyHint="Your tasks will appear ranked P0–P2 with an estimate and a time block each."
        >
          {plan ? (
            <div className="space-y-5">
              <div className="flex gap-3 rounded-lg border border-primary/20 bg-accent/50 px-4 py-3">
                <Target className="mt-0.5 size-4 shrink-0 text-accent-foreground" aria-hidden />
                <p className="text-sm leading-relaxed">{plan.focusNote}</p>
              </div>

              <ol className="divide-y rounded-lg border">
                {plan.tasks.map((t, i) => (
                  <li key={i} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:gap-4">
                    <span className="font-mono text-xs text-muted-foreground sm:w-28 sm:shrink-0 sm:pt-0.5">
                      {t.scheduled}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{t.title}</p>
                        <Badge
                          variant="outline"
                          className={priorityTone[t.priority] ?? priorityTone["P2"]}
                        >
                          {t.priority}
                        </Badge>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="size-3" aria-hidden />
                          {t.estimatedMinutes} min
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{t.rationale}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </OutputPanel>
      </div>
    </div>
  );
}