import Link from "next/link";
import { CheckCircle2, Sparkles, ArrowRight, User } from "lucide-react";
import { Container } from "@/components/ui";

export const metadata = {
  title: "Email Verified Successfully | Wallora",
  description: "Your Wallora account has been verified successfully. Enjoy pristine 4K wallpapers and live backgrounds.",
};

export default function VerifiedPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center py-16 px-6">
      <Container className="max-w-lg mx-auto">
        <div className="relative rounded-3xl border border-white/10 bg-[#0c213d]/90 p-8 sm:p-12 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 size-40 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 right-10 size-32 rounded-full bg-accent/15 blur-2xl" />

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-bold tracking-widest text-emerald-400 uppercase mb-6">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Verification Complete
          </div>

          {/* Animated Verified Check Icon */}
          <div className="relative mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-emerald-400/10 to-transparent border border-emerald-500/30 shadow-inner">
            <CheckCircle2 className="size-11 text-emerald-400" />
          </div>

          {/* Heading & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
            Email Verified Successfully!
          </h1>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-8">
            Your email has been confirmed and your Wallora account is active. You are ready to explore and download curated 4K UHD and live motion wallpapers.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/wallpapers"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#081d37] shadow-lg transition-all hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="size-4" />
              <span>Explore Wallpapers</span>
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/account"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-white/30 hover:bg-white/10 active:scale-[0.98]"
            >
              <User className="size-4" />
              <span>My Account</span>
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
