import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

const buttonStyles = {
  base: "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-50 disabled:pointer-events-none",
  variant: {
    primary: "bg-accent text-accent-foreground font-semibold hover:opacity-90",
    secondary: "bg-surface border border-border text-foreground hover:border-accent/50",
    ghost: "text-muted hover:text-foreground hover:bg-surface",
    danger: "bg-red-600 text-white hover:bg-red-500",
  },
  size: {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-12 px-7 text-base",
  },
} as const;

type Variant = keyof typeof buttonStyles.variant;
type Size = keyof typeof buttonStyles.size;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(buttonStyles.base, buttonStyles.variant[variant], buttonStyles.size[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link
      className={cn(buttonStyles.base, buttonStyles.variant[variant], buttonStyles.size[size], className)}
      {...props}
    />
  );
}

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "accent" | "free" | "mature";
}) {
  const tones = {
    neutral: "bg-surface-2 text-muted border-border",
    accent: "bg-accent/15 text-accent border-accent/30",
    free: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    mature: "bg-red-500/15 text-red-400 border-red-500/30",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
