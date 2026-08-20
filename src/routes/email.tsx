import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { generateEmail } from "@/lib/ai.functions";
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

const title = "Smart Email Generator — AI Workplace Assistant";
const description =
  "Generate send-ready professional emails tuned to a specific tone, audience, and length.";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: EmailPage,
});

const tones: string[] = ["Professional", "Direct", "Warm", "Persuasive", "Apologetic", "Formal"];
const audiences: string[] = [
  "Executive stakeholders",
  "Direct reports",
  "Cross-functional peers",
  "External client",
  "Vendor or partner",
  "Job candidate",
];
const lengths: string[] = ["Short (under 100 words)", "Standard (100-180 words)", "Detailed (200+ words)"];

function EmailPage() {
  const [context, setContext] = useState("");
  const [tone, setTone] = useState(tones[0]!);
  const [audience, setAudience] = useState(audiences[0]!);
  const [length, setLength] = useState(lengths[1]!);

  const fn = useServerFn(generateEmail);
  const mutation = useMutation({
    mutationFn: (input: { context: string; tone: string; audience: string; length: string }) =>
      fn({ data: input }),
  });

  const email = mutation.data?.email ?? "";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Communication"
        title="Smart Email Generator"
        description="Describe the situation. The assistant writes one send-ready email calibrated to your chosen tone and audience, without inventing facts."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <form
          className="space-y-5 rounded-xl border bg-card p-5 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (!context.trim()) {
              toast.error("Add some context for the email first.");
              return;
            }
            mutation.mutate({ context, tone, audience, length });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="context">What is this email about?</Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={7}
              placeholder="Follow up with Sarah on the Q3 budget proposal. We still need the final regional numbers by Friday, and I want to offer help if the delay is on their side."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Length</Label>
            <Select value={length} onValueChange={setLength}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lengths.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Generating draft…" : "Generate draft"}
          </Button>
        </form>

        <OutputPanel
          title="Generated draft"
          isLoading={mutation.isPending}
          isEmpty={!email}
          error={mutation.error ? "The draft could not be generated. Please try again." : null}
          emptyHint="Your draft will appear here with a subject line, greeting, body, and sign-off."
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(email);
                toast.success("Draft copied to clipboard");
              }}
            >
              <Copy className="size-3.5" /> Copy
            </Button>
          }
        >
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{email}</pre>
        </OutputPanel>
      </div>
    </div>
  );
}