import type { ReactNode } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { AiDisclaimer } from "./ai-disclaimer";
import { Skeleton } from "@/components/ui/skeleton";

export function OutputPanel({
  title,
  isLoading,
  isEmpty,
  emptyHint,
  error,
  actions,
  children,
}: {
  title: string;
  isLoading: boolean;
  isEmpty: boolean;
  emptyHint: string;
  error?: string | null;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="flex min-h-[420px] flex-col rounded-xl border bg-card shadow-card">
      <header className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {isLoading ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            Generating
          </span>
        ) : (
          !isEmpty && actions
        )}
      </header>

      <div className="flex-1 px-5 py-5">
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-live="polite">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isEmpty ? (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
            <div className="grid size-10 place-items-center rounded-full bg-accent">
              <Sparkles className="size-4 text-accent-foreground" aria-hidden />
            </div>
            <p className="mt-3 max-w-[38ch] text-sm text-muted-foreground">{emptyHint}</p>
          </div>
        ) : (
          children
        )}
      </div>

      <footer className="border-t px-5 py-3">
        <AiDisclaimer />
      </footer>
    </section>
  );
}