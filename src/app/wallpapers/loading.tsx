import { Container } from "@/components/ui";
import { MasonrySkeleton } from "@/components/masonry-grid";

export default function Loading() {
  return (
    <Container className="py-8 sm:py-12">
      <div className="mb-6 space-y-2">
        <div className="skeleton h-8 w-56 rounded-lg" />
        <div className="skeleton h-4 w-32 rounded" />
      </div>
      <MasonrySkeleton count={12} />
    </Container>
  );
}
