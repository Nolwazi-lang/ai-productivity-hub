import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { runResearch } from "@/lib/ai.functions";
import { DEPTHS, usePreferences } from "@/lib/preferences";
import { PageHeader } from "@/components/page-header";
import { OutputPanel } from "@/components/output-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Markdown } from "@/components/markdown";

const title = "AI Research Assistant — AI Workplace Assistant";
const description =
  "Get a structured research briefing with an executive summary, key insights, risks, and next steps.";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ResearchPage,
});

const depths: readonly string[] = DEPTHS;

function ResearchPage() {
  const { preferences, loaded } = usePreferences();
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState(depths[1]!);

  useEffect(() => {
    if (loaded) setDepth(preferences.depth);
  }, [loaded, preferences]);

  const fn = useServerFn(runResearch);
  const mutation = useMutation({
    mutationFn: (input: { topic: string; depth: string }) => fn({ data: input }),
  });
  const briefing = mutation.data?.briefing ?? "";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Research"
        title="AI Research Assistant"
        description="Ask a work question and get a briefing you can act on: executive summary, key insights, risks to weigh, and suggested next steps."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <form
          className="space-y-5 rounded-xl border bg-card p-5 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (!topic.trim()) {
              toast.error("Enter a research question first.");
              return;
            }
            mutation.mutate({ topic, depth });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="topic">Research question</Label>
            <Textarea
              id="topic"
              rows={8}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What should a mid-size B2B software team consider before moving from annual to quarterly performance reviews?"
            />
          </div>
          <div className="space-y-2">
            <Label>Depth</Label>
            <Select value={depth} onValueChange={setDepth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {depths.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Researching…" : "Generate briefing"}
          </Button>
        </form>

        <OutputPanel
          title="Briefing"
          isLoading={mutation.isPending}
          isEmpty={!briefing}
          error={mutation.error ? "The briefing could not be generated. Please try again." : null}
          emptyHint="Your briefing will appear here with a summary, insights, risks, and next steps."
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(briefing);
                toast.success("Briefing copied to clipboard");
              }}
            >
              <Copy className="size-3.5" /> Copy
            </Button>
          }
        >
          <Markdown content={briefing} />
        </OutputPanel>
      </div>
    </div>
  );
}