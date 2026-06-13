import { PostForm } from "@/components/admin/post-form";

export default function NewPostPage() {
  return (
    <div>
      <h2 className="mb-5 text-lg font-semibold">New blog post</h2>
      <PostForm />
    </div>
  );
}
