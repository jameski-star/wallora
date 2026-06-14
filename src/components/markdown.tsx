import React from "react";
import { cn } from "@/lib/utils";

/**
 * A tiny, dependency-free Markdown renderer for blog post bodies.
 *
 * Posts are authored as plain text in the admin CMS; without this they render
 * as one undifferentiated block. This supports the common subset an author
 * actually reaches for — headings, bold/italic, inline code, links, ordered and
 * unordered lists, blockquotes, fenced code blocks and horizontal rules — and
 * falls back to plain paragraphs for everything else.
 *
 * It returns real React elements (never `dangerouslySetInnerHTML`), so author
 * text can't inject markup: any stray `<` is rendered as a literal character.
 */
export function Markdown({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-5 text-base leading-relaxed text-foreground/90",
        className,
      )}
    >
      {renderBlocks(source)}
    </div>
  );
}

/* ── Block-level parsing ──────────────────────────────────────────────────── */

function renderBlocks(source: string): React.ReactNode[] {
  // Normalise newlines so Windows/CRLF input splits the same as LF.
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const out: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines between blocks.
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Fenced code block: ``` … ```
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++; // consume the closing fence (or run off the end)
      out.push(
        <pre
          key={key++}
          className="overflow-x-auto rounded-card border border-border bg-surface-2 p-4 text-sm"
        >
          <code className="font-mono text-foreground/90">
            {body.join("\n")}
          </code>
        </pre>,
      );
      continue;
    }

    // ATX heading: #, ##, … ######
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      out.push(renderHeading(heading[1].length, heading[2], key++));
      i++;
      continue;
    }

    // Horizontal rule: ---, ***, ___ (3+).
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      out.push(<hr key={key++} className="border-border" />);
      i++;
      continue;
    }

    // Blockquote: one or more leading "> " lines.
    if (/^\s*>\s?/.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoted.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      out.push(
        <blockquote
          key={key++}
          className="border-l-2 border-accent/60 pl-4 italic text-muted"
        >
          {renderInline(quoted.join(" "))}
        </blockquote>,
      );
      continue;
    }

    // Unordered list: -, *, + markers.
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      out.push(
        <ul key={key++} className="list-disc space-y-1.5 pl-6 marker:text-muted">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list: 1. 2) …
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      out.push(
        <ol
          key={key++}
          className="list-decimal space-y-1.5 pl-6 marker:text-muted"
        >
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph: consume consecutive non-blank lines that aren't another block.
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !startsBlock(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    out.push(
      <p key={key++}>{renderInline(para.join("\n"))}</p>,
    );
  }

  return out;
}

/** True when a line opens a non-paragraph block, so paragraphs stop before it. */
function startsBlock(line: string): boolean {
  return (
    /^```/.test(line) ||
    /^(#{1,6})\s+/.test(line) ||
    /^\s*>\s?/.test(line) ||
    /^\s*[-*+]\s+/.test(line) ||
    /^\s*\d+[.)]\s+/.test(line) ||
    /^\s*([-*_])(\s*\1){2,}\s*$/.test(line)
  );
}

function renderHeading(level: number, text: string, key: number): React.ReactNode {
  const content = renderInline(text);
  const cls = {
    1: "mt-2 text-3xl font-bold tracking-tight",
    2: "mt-2 text-2xl font-bold tracking-tight",
    3: "mt-1 text-xl font-semibold",
    4: "text-lg font-semibold",
    5: "text-base font-semibold",
    6: "text-sm font-semibold uppercase tracking-wide text-muted",
  }[level as 1 | 2 | 3 | 4 | 5 | 6];

  switch (level) {
    case 1:
      return <h2 key={key} className={cls}>{content}</h2>;
    case 2:
      return <h2 key={key} className={cls}>{content}</h2>;
    case 3:
      return <h3 key={key} className={cls}>{content}</h3>;
    case 4:
      return <h4 key={key} className={cls}>{content}</h4>;
    case 5:
      return <h5 key={key} className={cls}>{content}</h5>;
    default:
      return <h6 key={key} className={cls}>{content}</h6>;
  }
}

/* ── Inline parsing ───────────────────────────────────────────────────────── */

/** Inline spans, ordered so code is matched before emphasis (code is opaque). */
const INLINE_RULES: {
  re: RegExp;
  render: (m: RegExpMatchArray, key: number) => React.ReactNode;
}[] = [
  {
    re: /`([^`]+)`/,
    render: (m, key) => (
      <code
        key={key}
        className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]"
      >
        {m[1]}
      </code>
    ),
  },
  {
    re: /\[([^\]]+)\]\(([^)\s]+)\)/,
    render: (m, key) => {
      const href = m[2];
      const external = /^https?:\/\//.test(href);
      return (
        <a
          key={key}
          href={href}
          className="font-medium text-accent underline-offset-2 hover:underline"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {renderInline(m[1])}
        </a>
      );
    },
  },
  {
    re: /\*\*([\s\S]+?)\*\*/,
    render: (m, key) => (
      <strong key={key} className="font-semibold text-foreground">
        {renderInline(m[1])}
      </strong>
    ),
  },
  {
    re: /__([\s\S]+?)__/,
    render: (m, key) => (
      <strong key={key} className="font-semibold text-foreground">
        {renderInline(m[1])}
      </strong>
    ),
  },
  {
    re: /\*([\s\S]+?)\*/,
    render: (m, key) => <em key={key}>{renderInline(m[1])}</em>,
  },
  {
    re: /_([\s\S]+?)_/,
    render: (m, key) => <em key={key}>{renderInline(m[1])}</em>,
  },
];

/**
 * Render inline Markdown (emphasis, code, links) within a block. Finds the
 * earliest-matching rule, emits the text before it verbatim, renders the match,
 * then recurses on the remainder. A bare `\n` inside a paragraph becomes a soft
 * line break.
 */
function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let rest = text;
  let key = 0;

  while (rest.length > 0) {
    let bestIndex = Infinity;
    let bestRule: (typeof INLINE_RULES)[number] | null = null;
    let bestMatch: RegExpMatchArray | null = null;

    for (const rule of INLINE_RULES) {
      const m = rest.match(rule.re);
      if (m && m.index !== undefined && m.index < bestIndex) {
        bestIndex = m.index;
        bestRule = rule;
        bestMatch = m;
      }
    }

    if (!bestRule || !bestMatch) {
      pushText(out, rest, key++);
      break;
    }

    if (bestIndex > 0) {
      pushText(out, rest.slice(0, bestIndex), key++);
    }
    out.push(bestRule.render(bestMatch, key++));
    rest = rest.slice(bestIndex + bestMatch[0].length);
  }

  return out;
}

/** Emit plain text, turning single newlines into <br/> soft breaks. */
function pushText(out: React.ReactNode[], text: string, key: number): void {
  if (!text) return;
  const segments = text.split("\n");
  segments.forEach((seg, j) => {
    if (j > 0) out.push(<br key={`${key}-br-${j}`} />);
    if (seg) out.push(<React.Fragment key={`${key}-${j}`}>{seg}</React.Fragment>);
  });
}
