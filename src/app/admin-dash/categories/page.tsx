import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { getRepo } from "@/lib/repo";
import { saveCategory, deleteCategory } from "@/app/admin-dash/actions";

type SP = Promise<{ edit?: string }>;

const inp =
  "h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-accent/60";

export default async function AdminCategories({
  searchParams,
}: {
  searchParams: SP;
}) {
  const { edit } = await searchParams;
  const repo = await getRepo();
  const [categories, wallpapers] = await Promise.all([
    repo.listCategories(),
    repo.listWallpapers({ includeMature: true, limit: 10_000 }),
  ]);

  const counts = new Map<string, number>();
  for (const w of wallpapers)
    counts.set(w.categorySlug, (counts.get(w.categorySlug) ?? 0) + 1);

  const editing = edit ? categories.find((c) => c.slug === edit) ?? null : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">
          {editing ? `Edit “${editing.name}”` : "Add a category"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Categories organise your wallpapers and power the gallery filters. The
          slug is fixed once created (wallpapers reference it).
        </p>
        <form action={saveCategory} className="mt-4 grid gap-4 sm:grid-cols-2">
          {editing && <input type="hidden" name="slug" value={editing.slug} />}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Name</span>
            <input name="name" required defaultValue={editing?.name} placeholder="e.g. Nature" className={inp} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Description</span>
            <input
              name="description"
              defaultValue={editing?.description}
              placeholder="Short description shown on the category"
              className={inp}
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" size="sm">
              {editing ? "Save changes" : "Add category"}
            </Button>
            {editing && (
              <Link
                href="/admin-dash/categories"
                className="inline-flex h-9 items-center rounded-lg px-3 text-sm text-muted hover:text-foreground"
              >
                Cancel
              </Link>
            )}
          </div>
        </form>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted">
          {categories.length} categories
        </h3>
        <div className="overflow-hidden rounded-card border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase text-muted">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Slug</th>
                <th className="p-3 font-medium">Wallpapers</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => {
                const count = counts.get(c.slug) ?? 0;
                return (
                  <tr key={c.slug} className="bg-surface/40">
                    <td className="p-3">
                      <p className="font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted">{c.description}</p>
                    </td>
                    <td className="p-3 font-mono text-xs text-muted">{c.slug}</td>
                    <td className="p-3 tabular-nums">{count}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin-dash/categories?edit=${c.slug}`}
                          className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground"
                          aria-label={`Edit ${c.name}`}
                        >
                          <Pencil size={15} />
                        </Link>
                        <form action={deleteCategory}>
                          <input type="hidden" name="slug" value={c.slug} />
                          <button
                            type="submit"
                            aria-label={`Delete ${c.name}`}
                            disabled={count > 0}
                            title={count > 0 ? "Move or delete its wallpapers first" : "Delete"}
                            className="grid size-8 place-items-center rounded-md text-muted enabled:hover:bg-surface-2 enabled:hover:text-red-400 disabled:opacity-30"
                          >
                            <Trash2 size={15} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
