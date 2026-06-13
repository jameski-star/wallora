import { savePost } from "@/app/admin-dash/actions";
import { Button } from "@/components/ui";
import type { Post } from "@/lib/types";

const inp =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-accent/60";

/** Create/edit form for a blog post. Posts to the `savePost` server action. */
export function PostForm({ post }: { post?: Post }) {
  const p = post;
  return (
    <form action={savePost} className="space-y-5">
      {p && <input type="hidden" name="id" value={p.id} />}
      {p && <input type="hidden" name="createdAt" value={p.createdAt} />}

      <Row>
        <Field label="Title" required>
          <input name="title" required defaultValue={p?.title} className={inp} />
        </Field>
        <Field label="Slug" hint="Auto-generated if blank">
          <input name="slug" defaultValue={p?.slug} placeholder="auto" className={inp} />
        </Field>
      </Row>

      <Field label="Excerpt" hint="Short summary shown in listings and search results">
        <textarea name="excerpt" rows={2} defaultValue={p?.excerpt} className={inp} />
      </Field>

      <Field label="Body" hint="Separate paragraphs with a blank line" required>
        <textarea name="body" rows={12} required defaultValue={p?.body} className={inp} />
      </Field>

      <Row>
        <Field label="Cover image" hint="Cloudinary public id or absolute URL">
          <input name="coverImage" defaultValue={p?.coverImage} className={inp} />
        </Field>
        <Field label="Author">
          <input name="author" defaultValue={p?.author ?? "Aurava"} className={inp} />
        </Field>
      </Row>

      <Field label="Tags" hint="Comma-separated">
        <input name="tags" defaultValue={p?.tags.join(", ")} placeholder="guide, tips" className={inp} />
      </Field>

      <Row>
        <Field label="SEO title" hint="Defaults to the post title">
          <input name="seoTitle" defaultValue={p?.seoTitle} className={inp} />
        </Field>
        <Field label="SEO description" hint="Defaults to the excerpt">
          <input name="seoDescription" defaultValue={p?.seoDescription} className={inp} />
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
