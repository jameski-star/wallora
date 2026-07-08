import { Container } from "@/components/ui";
import { MasonrySkeleton } from "@/components/masonry-grid";

export default function Loading() {
  return (
    <Container className="py-8 sm:py-12">
      <div className="mb-6 space-y-2">
        {/* Skeleton header */}
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-4 w-64 rounded" />
      </div>
      {/* Skeleton wallpaper grid */}
      <MasonrySkeleton count={12} />
    </Container>
  );
}
