import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Loader2, SendHorizontal, User, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { sendChat } from "@/lib/ai.functions";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const title = "Assistant Chat — AI Workplace Assistant";
const description =
  "Chat with your workplace productivity assistant about drafting, planning, summarizing, and research.";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ChatPage,
});

type Message = { role: "user" | "assistant"; content: string };

const starters = [
  "Help me say no to a meeting without burning the relationship.",
  "Turn these three bullet points into a status update for my VP.",
  "How should I structure a weekly review that actually sticks?",
];

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const fn = useServerFn(sendChat);
  const mutation = useMutation({
    mutationFn: (history: Message[]) => fn({ data: { messages: history } }),
    onSuccess: (res) => setMessages((m) => [...m, { role: "assistant", content: res.reply }]),
    onError: () => toast.error("The assistant could not reply. Please try again."),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, mutation.isPending]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;
    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    mutation.mutate(next);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        eyebrow="Assistant"
        title="Assistant Chat"
        description="A running conversation for everything that does not fit a single workflow. Ask follow-ups; the assistant keeps the thread in context."
      />

      <div className="flex min-h-[60vh] flex-col rounded-xl border bg-card shadow-card">
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
          {messages.length === 0 && !mutation.isPending ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="grid size-10 place-items-center rounded-full bg-accent">
                <Sparkles className="size-4 text-accent-foreground" aria-hidden />
              </div>
              <p className="max-w-[44ch] text-sm text-muted-foreground">
                Ask anything about your work day, or start with one of these.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="max-w-xs rounded-lg border bg-background px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className={`grid size-7 shrink-0 place-items-center rounded-md ${
                    m.role === "user" ? "bg-muted" : "bg-primary"
                  }`}
                >
                  {m.role === "user" ? (
                    <User className="size-3.5 text-muted-foreground" aria-hidden />
                  ) : (
                    <Sparkles className="size-3.5 text-primary-foreground" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="label-eyebrow">{m.role === "user" ? "You" : "Assistant"}</p>
                  <div className="mt-1.5">
                    {m.role === "user" ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                    ) : (
                      <Markdown content={m.content} />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {mutation.isPending && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Assistant is thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          className="border-t px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <div className="flex items-end gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              rows={2}
              placeholder="Ask the assistant… (Enter to send, Shift+Enter for a new line)"
              className="min-h-[52px] resize-none"
            />
            <Button type="submit" size="icon" disabled={mutation.isPending} aria-label="Send">
              <SendHorizontal className="size-4" />
            </Button>
          </div>
          <AiDisclaimer className="mt-3" />
        </form>
      </div>
    </div>
  );
}