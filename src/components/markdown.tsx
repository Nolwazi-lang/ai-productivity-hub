import ReactMarkdown from "react-markdown";

export function Markdown({ content }: { content: string }) {
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <ReactMarkdown
        components={{
          h1: (p) => <h3 className="mt-5 text-base font-semibold" {...p} />,
          h2: (p) => <h3 className="mt-5 label-eyebrow" {...p} />,
          h3: (p) => <h4 className="mt-4 text-sm font-semibold" {...p} />,
          p: (p) => <p className="leading-relaxed" {...p} />,
          ul: (p) => <ul className="ml-1 space-y-1.5" {...p} />,
          ol: (p) => <ol className="ml-5 list-decimal space-y-1.5" {...p} />,
          li: (p) => (
            <li className="relative pl-4 before:absolute before:left-0 before:top-2 before:size-1.5 before:rounded-full before:bg-primary marker:text-muted-foreground [ol_&]:pl-0 [ol_&]:before:hidden">
              {p.children}
            </li>
          ),
          strong: (p) => <strong className="font-semibold" {...p} />,
          code: (p) => (
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]" {...p} />
          ),
          a: (p) => <a className="text-primary underline underline-offset-2" {...p} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}