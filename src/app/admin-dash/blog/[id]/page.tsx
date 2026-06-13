import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { getRepo } from "@/lib/repo";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const repo = await getRepo();
  const post = await repo.getPostById(id);
  if (!post) notFound();

  return (
    <div>
      <h2 className="mb-5 text-lg font-semibold">Edit “{post.title}”</h2>
      <PostForm post={post} />
    </div>
  );
}
