import Link from "next/link";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import { ButtonLink, Badge } from "@/components/ui";
import { getRepo } from "@/lib/repo";
import { deletePost } from "@/app/admin-dash/actions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminBlog() {
  const repo = await getRepo();
  const posts = await repo.listPosts({ includeUnpublished: true, limit: 500 });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Blog posts ({posts.length})</h2>
        <ButtonLink href="/admin-dash/blog/new" size="sm">
          <Plus size={15} /> New post
        </ButtonLink>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-card border border-dashed border-border bg-surface/50 p-10 text-center text-sm text-muted">
          No posts yet. Write your first one to launch the blog.
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase text-muted">
              <tr>
                <th className="p-3 font-medium">Title</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {posts.map((p) => (
                <tr key={p.id} className="bg-surface/40">
                  <td className="p-3">
                    <p className="font-medium">{p.title}</p>
                    <p className="truncate text-xs text-muted">{p.slug}</p>
                  </td>
                  <td className="p-3 whitespace-nowrap text-muted">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="p-3">
                    {p.published ? (
                      <Badge tone="free">Published</Badge>
                    ) : (
                      <Badge>Draft</Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      {p.published && (
                        <Link
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground"
                          aria-label="View"
                        >
                          <ExternalLink size={15} />
                        </Link>
                      )}
                      <Link
                        href={`/admin-dash/blog/${p.id}`}
                        className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <form action={deletePost}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          aria-label="Delete"
                          className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
