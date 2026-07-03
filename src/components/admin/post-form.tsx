"use client";

import { useState, useTransition } from "react";
import { savePost, generateAiBlog } from "@/app/admin-dash/actions";
import { Button } from "@/components/ui";
import type { Post } from "@/lib/types";
import { Sparkles, AlertCircle } from "lucide-react";

const inp =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-accent/60";

/** Create/edit form for a blog post. Posts to the `savePost` server action. */
export function PostForm({ post }: { post?: Post }) {
  const p = post;

  const [title, setTitle] = useState(p?.title ?? "");
  const [slug, setSlug] = useState(p?.slug ?? "");
  const [excerpt, setExcerpt] = useState(p?.excerpt ?? "");
  const [body, setBody] = useState(p?.body ?? "");
  const [coverImage, setCoverImage] = useState(p?.coverImage ?? "");
  const [author, setAuthor] = useState(p?.author ?? "Aurava Editorial Team");
  const [tags, setTags] = useState(p?.tags.join(", ") ?? "");
  const [seoTitle, setSeoTitle] = useState(p?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(p?.seoDescription ?? "");

  const [aiTopic, setAiTopic] = useState("");
  const [isPending, startTransition] = useTransition();
  const [aiError, setAiError] = useState("");

  const handleAiGenerate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    setAiError("");

    startTransition(async () => {
      const res = await generateAiBlog(aiTopic);
      if (res.ok) {
        setTitle(res.data.title);
        setSlug(res.data.slug);
        setExcerpt(res.data.excerpt);
        setBody(res.data.body);
        setCoverImage(res.data.coverImage);
        setAuthor(res.data.author);
        setTags(res.data.tags.join(", "));
        setSeoTitle(res.data.seoTitle);
        setSeoDescription(res.data.seoDescription);
      } else {
        setAiError(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Blog Generation Panel */}
      <div className="rounded-card border border-accent/20 bg-accent/[0.02] p-5 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 size-24 rounded-full bg-accent/5 blur-xl pointer-events-none" />
        <div className="flex items-start gap-3">
          <div className="grid size-8 place-items-center rounded-lg bg-accent/10 text-accent">
            <Sparkles size={16} className={isPending ? "animate-pulse" : ""} />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Blog Writer</h3>
              <p className="text-xs text-muted">Generate a draft article using the Aurava Master Prompt (powered by Gemini).</p>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. OLED vs Mini LED monitor display differences for HDR setups"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent/60"
              />
              <Button
                type="button"
                onClick={handleAiGenerate}
                disabled={isPending || !aiTopic.trim()}
                className="shrink-0 bg-accent text-accent-foreground hover:opacity-90 transition disabled:opacity-50"
              >
                {isPending ? "Generating Draft..." : "Generate Post"}
              </Button>
            </div>

            {aiError && (
              <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                <AlertCircle size={12} />
                <span>{aiError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form action={savePost} className="space-y-5">
        {p && <input type="hidden" name="id" value={p.id} />}
        {p && <input type="hidden" name="createdAt" value={p.createdAt} />}

        <Row>
          <Field label="Title" required>
            <input
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inp}
            />
          </Field>
          <Field label="Slug" hint="Auto-generated if blank">
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto"
              className={inp}
            />
          </Field>
        </Row>

        <Field label="Excerpt" hint="Short summary shown in listings and search results">
          <textarea
            name="excerpt"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className={inp}
          />
        </Field>

        <Field
          label="Body"
          hint="Markdown supported — # headings, ## subheadings, **bold**, *italic*, - lists, > quotes, [links](url). Separate paragraphs with a blank line."
          required
        >
          <textarea
            name="body"
            rows={15}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`${inp} font-mono text-xs`}
          />
        </Field>

        <Row>
          <Field label="Cover image" hint="Cloudinary public id or absolute URL">
            <input
              name="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className={inp}
            />
          </Field>
          <Field label="Author">
            <input
              name="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className={inp}
            />
          </Field>
        </Row>

        <Field label="Tags" hint="Comma-separated">
          <input
            name="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="guide, tips"
            className={inp}
          />
        </Field>

        <Row>
          <Field label="SEO title" hint="Defaults to the post title">
            <input
              name="seoTitle"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className={inp}
            />
          </Field>
          <Field label="SEO description" hint="Defaults to the excerpt">
            <input
              name="seoDescription"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className={inp}
            />
          </Field>
        </Row>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="published"
            defaultChecked={p ? p.published : true}
            className="size-4 rounded border-border"
          />
          Published (visible on the public blog)
        </label>

        <div className="flex gap-2">
          <Button type="submit">{p ? "Save changes" : "Publish post"}</Button>
        </div>
      </form>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
