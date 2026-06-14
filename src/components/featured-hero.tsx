"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { ProtectedImage } from "./protected-image";

export function FeaturedHero({
  slug,
  title,
  caption,
  description,
  previewSrc,
  width,
  height,
  // The hero title is a wallpaper *name*, not the page's topic, so it defaults
  // to <h2>. The page supplies its own keyword-bearing <h1> for SEO, and using
  // multiple heroes on one page no longer produces duplicate <h1>s.
  titleAs: TitleTag = "h2",
}: {
  slug: string;
  title: string;
  caption: string;
  description: string;
  previewSrc: string;
  width: number;
  height: number;
  titleAs?: "h1" | "h2";
}) {
  return (
    <section className="relative overflow-hidden rounded-card border border-border bg-surface">
      <div className="grid items-stretch gap-0 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center p-8 sm:p-12"
        >
          <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Sparkles size={13} /> {caption}
          </span>
          <TitleTag className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{title}</TitleTag>
          <p className="mt-4 max-w-md text-pretty text-muted">{description}</p>
          <Link
            href={`/wallpapers/${slug}`}
            className="group mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-accent-foreground transition hover:opacity-90"
          >
            View wallpaper
            <ArrowRight size={18} className="transition group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[280px]"
        >
          <Link href={`/wallpapers/${slug}`} className="absolute inset-0">
            <ProtectedImage
              src={previewSrc}
              alt={title}
              width={width}
              height={height}
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              className="h-full"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
