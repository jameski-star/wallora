import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Newspaper } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { listPosts } from "@/lib/blog";
import { postImageUrl } from "@/lib/cloudinary";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides, tips and announcements from Wallora — how to find, customise and get the most from your wallpapers.",
  alternates: { canonical: "/blog" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogIndex() {
  const posts = await listPosts();

  return (
    <Container className="py-8 sm:py-12">
      <SectionHeading
        title="The Wallora Blog"
        subtitle="Guides, tips and announcements."
      />

      {posts.length === 0 ? (
        <div className="grid place-items-center rounded-card border border-dashed border-border bg-surface/50 py-24 text-center">
          <Newspaper className="mb-3 text-muted" size={40} />
          <p className="text-lg font-medium">No posts yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Check back soon — new articles are on the way.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const cover = postImageUrl(p.coverImage, { width: 700 });
            return (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-accent/40"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={p.title}
                      fill
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-muted">
                      <Newspaper size={32} />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs text-muted">{formatDate(p.createdAt)}</p>
                  <h2 className="mt-1 text-lg font-semibold leading-snug group-hover:text-accent">
                    {p.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{p.excerpt}</p>
                  <span className="mt-4 text-sm font-medium text-accent">
                    Read more →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
