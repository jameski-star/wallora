import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ButtonLink, Badge } from "@/components/ui";
import { getRepo } from "@/lib/repo";
import { deleteWallpaper } from "@/app/admin-dash/actions";
import { previewUrl } from "@/lib/cloudinary";
import { formatPrice } from "@/lib/utils";

export default async function AdminWallpapers() {
  const repo = await getRepo();
  const wallpapers = await repo.listWallpapers({
    includeMature: true,
    sort: "newest",
    limit: 500,
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Wallpapers ({wallpapers.length})</h2>
        <ButtonLink href="/admin-dash/wallpapers/new" size="sm">
          <Plus size={15} /> Add
        </ButtonLink>
      </div>

      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase text-muted">
            <tr>
              <th className="p-3 font-medium">Wallpaper</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Flags</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {wallpapers.map((w) => (
              <tr key={w.id} className="bg-surface/40">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-md">
                      <Image src={previewUrl(w, { width: 120 })} alt="" fill sizes="48px" className="object-cover" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{w.title}</p>
                      <p className="truncate text-xs text-muted">{w.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 capitalize">{w.categorySlug}</td>
                <td className="p-3">{w.isPremium ? formatPrice(w.priceCents) : "Free"}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {w.isPremium && <Badge tone="accent">Premium</Badge>}
                    {w.isMature && <Badge tone="mature">18+</Badge>}
                    {w.isFeatured && <Badge>★</Badge>}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin-dash/wallpapers/${w.id}`}
                      className="grid size-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-foreground"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </Link>
                    <form action={deleteWallpaper}>
                      <input type="hidden" name="id" value={w.id} />
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
    </div>
  );
}
