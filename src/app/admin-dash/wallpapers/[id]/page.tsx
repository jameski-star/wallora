import { notFound } from "next/navigation";
import { WallpaperForm } from "@/components/admin/wallpaper-form";
import { getRepo } from "@/lib/repo";

export default async function EditWallpaperPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repo = await getRepo();
  const [wallpaper, categories] = await Promise.all([
    repo.getWallpaperById(id),
    repo.listCategories(),
  ]);
  if (!wallpaper) notFound();

  return (
    <div>
      <h2 className="mb-5 text-lg font-semibold">Edit “{wallpaper.title}”</h2>
      <WallpaperForm wallpaper={wallpaper} categories={categories} />
    </div>
  );
}
