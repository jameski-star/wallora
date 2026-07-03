import { NextResponse } from "next/server";
import { listPosts } from "@/lib/blog";

export async function GET() {
  const posts = await listPosts();
  return NextResponse.json(
    posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      author: p.author,
      tags: p.tags,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      // Omit the full post body from list endpoints to keep response sizes small.
    }))
  );
}
