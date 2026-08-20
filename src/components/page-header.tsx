import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="label-eyebrow">{eyebrow}</p>
        <h1 className="mt-1.5 text-2xl font-semibold">{title}</h1>
        <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  );
}