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
    <div className={cn("mx-auto w-full max-w-7xl px-6 md:px-12", className)}>
      {children}
    </div>
  );
}

const buttonStyles = {
  base: "inline-flex items-center justify-center gap-2 rounded-none font-bold tracking-widest text-xs uppercase transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  variant: {
    primary: "bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20",
    secondary: "border border-primary text-primary hover:bg-primary hover:text-white",
    accent: "bg-accent text-secondary hover:brightness-105",
    ghost: "text-white/70 hover:text-accent hover:bg-white/5",
    danger: "bg-red-600 text-white hover:bg-red-500",
  },
  size: {
    sm: "h-9 px-4 text-[11px]",
    md: "h-11 px-6 text-xs",
    lg: "h-13 px-8 text-sm",
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
    neutral: "bg-[#112b4a]/90 text-white/80 border-white/15",
    accent: "bg-[#081d37]/90 text-accent border-accent/40 font-bold",
    free: "bg-[#081d37]/90 text-white border-white/20 font-bold",
    mature: "bg-[#081d37]/90 text-white/70 border-white/20 font-mono",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-none border px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold",
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
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
      <div>
        <div className="w-8 h-1 bg-accent mb-3" />
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl uppercase">{title}</h2>
        {subtitle && <p className="mt-1.5 text-xs font-semibold tracking-wider text-white/60 uppercase">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
