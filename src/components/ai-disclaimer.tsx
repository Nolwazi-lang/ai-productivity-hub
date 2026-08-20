import { Info } from "lucide-react";

export function AiDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex items-center gap-1.5 text-[11px] text-muted-foreground ${className}`}
      role="note"
    >
      <Info className="size-3.5 shrink-0" aria-hidden />
      AI-generated content may require human review
    </p>
  );
}