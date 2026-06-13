import { Container, ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-7xl font-bold text-accent">404</p>
      <h1 className="mt-4 text-2xl font-bold">Wallpaper not found</h1>
      <p className="mt-2 max-w-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist, or the wallpaper may be
        age-restricted for your account.
      </p>
      <div className="mt-6 flex gap-3">
        <ButtonLink href="/wallpapers">Browse wallpapers</ButtonLink>
        <ButtonLink href="/" variant="secondary">Go home</ButtonLink>
      </div>
    </Container>
  );
}
