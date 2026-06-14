import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { Markdown } from "@/components/markdown";
import { getPost } from "@/lib/blog";
import { postImageUrl } from "@/lib/cloudinary";
import { abs } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found", robots: { index: false } };
  const url = abs(`/blog/${post.slug}`);
  const image = postImageUrl(post.coverImage, { width: 1200 });
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      ...(image ? { images: [{ url: image, alt: post.title }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const cover = postImageUrl(post.coverImage, { width: 1400 });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: post.author },
    mainEntityOfPage: abs(`/blog/${post.slug}`),
    ...(cover ? { image: cover } : {}),
  };

  return (
    <Container className="py-8 sm:py-12">
      <JsonLd data={jsonLd} />
      <article className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft size={15} /> All posts
        </Link>

        <header className="mt-6">
          <p className="text-sm text-muted">
            {formatDate(post.createdAt)} · {post.author}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-3 text-lg text-muted">{post.excerpt}</p>
          )}
        </header>

        {cover && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-card border border-border bg-surface-2">
            <Image
              src={cover}
              alt={post.title}
              fill
              priority
              sizes="(max-width:768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <Markdown source={post.body} className="mt-8" />

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
            {post.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </article>
    </Container>
  );
}
