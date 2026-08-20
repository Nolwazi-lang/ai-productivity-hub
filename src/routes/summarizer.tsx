import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarClock, CheckSquare, ListTree } from "lucide-react";
import { toast } from "sonner";
import { summarizeNotes } from "@/lib/ai.functions";
import { PageHeader } from "@/components/page-header";
import { OutputPanel } from "@/components/output-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const title = "Meeting Notes Summarizer — AI Workplace Assistant";
const description =
  "Turn raw meeting notes or transcripts into key points, owned action items, and deadlines.";

export const Route = createFileRoute("/summarizer")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: SummarizerPage,
});

const priorityTone: Record<string, string> = {
  high: "border-danger/30 bg-danger/10 text-danger",
  medium: "border-warning/30 bg-warning/10 text-warning",
  low: "border-border bg-muted text-muted-foreground",
};

function SummarizerPage() {
  const [notes, setNotes] = useState("");
  const fn = useServerFn(summarizeNotes);
  const mutation = useMutation({ mutationFn: (n: string) => fn({ data: { notes: n } }) });
  const result = mutation.data;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Meetings"
        title="Meeting Notes Summarizer"
        description="Paste rough notes or a transcript. The assistant extracts decisions, action items with owners, and every deadline it can find — without guessing."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <form
          className="space-y-5 rounded-xl border bg-card p-5 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (notes.trim().length < 20) {
              toast.error("Paste a bit more of the meeting notes.");
              return;
            }
            mutation.mutate(notes);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="notes">Raw notes or transcript</Label>
            <Textarea
              id="notes"
              rows={16}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                "Product sync, 45 min.\nDana: launch of Feature X slipping to Oct 12 because the security audit found two blockers.\nPriya will notify vendors of the timeline shift.\nAgreed to approve extra cloud budget.\nVendor contract expires Friday 5pm — Marcus to confirm renewal."
              }
            />
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Summarizing…" : "Summarize notes"}
          </Button>
        </form>

        <OutputPanel
          title="Structured summary"
          isLoading={mutation.isPending}
          isEmpty={!result}
          error={mutation.error ? "The summary could not be generated. Please try again." : null}
          emptyHint="Key points, action items with owners, and deadlines will appear here."
        >
          {result ? (
            <div className="space-y-7">
              <p className="text-sm leading-relaxed">{result.summary}</p>

              <section className="space-y-3">
                <h3 className="flex items-center gap-2 label-eyebrow">
                  <ListTree className="size-3.5" aria-hidden /> Key points
                </h3>
                <ul className="space-y-2">
                  {result.keyPoints.map((p, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="flex items-center gap-2 label-eyebrow">
                  <CheckSquare className="size-3.5" aria-hidden /> Action items
                </h3>
                <ul className="divide-y rounded-lg border">
                  {result.actionItems.map((a, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <span className="min-w-0 flex-1 text-sm">{a.task}</span>
                      <span className="font-mono text-[11px] text-muted-foreground">{a.owner}</span>
                      <Badge
                        variant="outline"
                        className={priorityTone[a.priority] ?? priorityTone.low}
                      >
                        {a.priority}
                      </Badge>
                    </li>
                  ))}
                  {result.actionItems.length === 0 && (
                    <li className="px-4 py-3 text-sm text-muted-foreground">
                      No explicit action items found.
                    </li>
                  )}
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="flex items-center gap-2 label-eyebrow">
                  <CalendarClock className="size-3.5" aria-hidden /> Deadlines
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.deadlines.map((d, i) => (
                    <div key={i} className="rounded-lg border bg-muted/40 px-4 py-3">
                      <p className="font-mono text-[11px] font-medium text-danger">{d.due}</p>
                      <p className="mt-1 text-sm">{d.item}</p>
                    </div>
                  ))}
                  {result.deadlines.length === 0 && (
                    <p className="text-sm text-muted-foreground">No dated commitments mentioned.</p>
                  )}
                </div>
              </section>
            </div>
          ) : null}
        </OutputPanel>
      </div>
    </div>
  );
}