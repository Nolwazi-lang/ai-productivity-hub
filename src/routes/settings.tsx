import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AUDIENCES,
  DEPTHS,
  DEFAULT_PREFERENCES,
  LENGTHS,
  TONES,
  usePreferences,
  type Preferences,
} from "@/lib/preferences";

const title = "Settings & Defaults — AI Workplace Assistant";
const description =
  "Save your default tone, audience, formatting, research depth, and working hours for every AI tool.";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { preferences, loaded, save, reset } = usePreferences();
  const [draft, setDraft] = useState<Preferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    if (loaded) setDraft(preferences);
  }, [loaded, preferences]);

  const set = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Settings & Defaults"
        description="These preferences pre-fill every AI tool so you don't reset the same options on each visit. They are stored locally in this browser."
      />

      <form
        className="space-y-8 rounded-xl border bg-card p-5 shadow-card"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.workingHours.trim()) {
            toast.error("Add a working window, e.g. 09:00 - 17:00.");
            return;
          }
          save(draft);
          toast.success("Defaults saved");
        }}
      >
        <section className="space-y-4">
          <div>
            <p className="label-eyebrow">Email Generator</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Default tone, audience, and formatting for generated drafts.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Default tone</Label>
              <Select value={draft.tone} onValueChange={(v) => set("tone", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default audience</Label>
              <Select value={draft.audience} onValueChange={(v) => set("audience", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Default length</Label>
            <Select value={draft.length} onValueChange={(v) => set("length", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LENGTHS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="space-y-4 border-t pt-6">
          <div>
            <p className="label-eyebrow">Research Assistant</p>
            <p className="mt-1 text-sm text-muted-foreground">
              How deep briefings should go by default.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Default depth</Label>
            <Select value={draft.depth} onValueChange={(v) => set("depth", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPTHS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="space-y-4 border-t pt-6">
          <div>
            <p className="label-eyebrow">Task Planner</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The working window used when scheduling task blocks.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workingHours">Default working window</Label>
            <Input
              id="workingHours"
              value={draft.workingHours}
              onChange={(e) => set("workingHours", e.target.value)}
              placeholder="09:00 - 17:00"
            />
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row">
          <Button type="submit" className="sm:w-auto">
            <Save className="size-3.5" /> Save defaults
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setDraft(DEFAULT_PREFERENCES);
              toast.success("Defaults restored");
            }}
          >
            <RotateCcw className="size-3.5" /> Reset to standard
          </Button>
        </div>
      </form>
    </div>
  );
}
