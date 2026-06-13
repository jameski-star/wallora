import { WallpaperForm } from "@/components/admin/wallpaper-form";
import { getRepo } from "@/lib/repo";

export default async function NewWallpaperPage() {
  const categories = await (await getRepo()).listCategories();
  return (
    <div>
      <h2 className="mb-5 text-lg font-semibold">Add wallpaper</h2>
      <WallpaperForm categories={categories} />
    </div>
  );
}
