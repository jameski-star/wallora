import "server-only";
import { getRepo } from "./repo";
import type { Post } from "./types";

/** Public blog reads. Drafts (unpublished) are excluded. */

export async function listPosts(limit?: number): Promise<Post[]> {
  return (await getRepo()).listPosts({ limit });
}

export async function getPost(slug: string): Promise<Post | null> {
  const post = await (await getRepo()).getPostBySlug(slug);
  if (!post || !post.published) return null;
  return post;
}
