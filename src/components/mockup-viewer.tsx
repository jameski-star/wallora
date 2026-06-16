"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, Download, Loader2, ShieldCheck, ShoppingBag, X } from "lucide-react";
import { StudioMockup } from "./studio-mockup";
import { Button } from "./ui";
import { useCart } from "./cart";
import { useFormatPrice } from "./currency";

export interface MockupTarget {
  id: string;
  slug: string;
  title: string;
  device: string;
  priceCents: number;
  isPremium: boolean;
  previewSrc: string;
  /** Live wallpapers: looping clip + still poster shown on the device screen. */
  videoSrc?: string | null;
  poster?: string;
}

interface MockupContextValue {
  open: () => void;
}

const MockupContext = createContext<MockupContextValue | null>(null);

/**
 * Wraps a wallpaper detail view and provides a fullscreen "studio" preview: any
 * descendant can call `useMockup().open()` to render the wallpaper on a realistic
 * phone / laptop / tablet. The modal carries the real purchase actions (checkout,
 * add-to-cart, free download) so the preview doubles as the buy surface.
 */
export function MockupViewer({
  target,
  children,
}: {
  target: MockupTarget;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  // Lock body scroll + close on Escape while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <MockupContext.Provider value={{ open: show }}>
      {children}
      <AnimatePresence>
        {open && <Modal target={target} onClose={close} />}
      </AnimatePresence>
    </MockupContext.Provider>
  );
}

export function useMockup(): MockupContextValue {
  const ctx = useContext(MockupContext);
  if (!ctx) throw new Error("useMockup must be used within MockupViewer");
  return ctx;
}

/** Non-throwing accessor: returns null outside a MockupViewer so shared
 *  components (e.g. BuyPanel, used in contexts without a viewer) stay reusable. */
export function useMockupOptional(): MockupContextValue | null {
  return useContext(MockupContext);
}

/** A clickable wrapper that opens the studio preview when its children are
 *  clicked or activated by keyboard. Used to make the detail-page image a
 *  trigger without leaking modal state into the server component. */
export function MockupTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { open } = useMockup();
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Preview on a device"
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className={className}
    >
      {children}
    </div>
  );
}

function Modal({ target, onClose }: { target: MockupTarget; onClose: () => void }) {
  const cart = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const inCart = cart.has(target.id);
  const formatPrice = useFormatPrice();

  const line = {
    wallpaperId: target.id,
    slug: target.slug,
    title: target.title,
    priceCents: target.priceCents,
    previewUrl: target.previewSrc,
    device: target.device,
  };

  function buyNow() {
    if (!cart.has(target.id)) cart.add(line);
    setBusy(true);
    router.push("/checkout");
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${target.title} preview on ${target.device}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="glass fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-4xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute -top-2 right-0 z-10 inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-lg transition hover:text-foreground sm:-right-2 sm:-top-3"
        >
          <X size={18} />
        </button>

        <StudioMockup
          device={target.device}
          src={target.previewSrc}
          alt={`${target.title} on a ${target.device}`}
          videoSrc={target.videoSrc}
          poster={target.poster}
          className="border border-border"
        />

        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="font-semibold">{target.title}</p>
            <p className="text-sm text-muted">
              {target.isPremium ? formatPrice(target.priceCents) : "Free"} ·{" "}
              <span className="capitalize">{target.device}</span> · studio preview
            </p>
          </div>

          {target.isPremium ? (
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1 sm:flex-none"
                onClick={() => (inCart ? cart.remove(target.id) : cart.add(line))}
              >
                {inCart ? <Check size={18} /> : null}
                {inCart ? "In cart" : "Add to cart"}
              </Button>
              <Button size="lg" className="flex-1 sm:flex-none" onClick={buyNow} disabled={busy}>
                {busy ? <Loader2 className="animate-spin" size={18} /> : <ShoppingBag size={18} />}
                Buy now
              </Button>
            </div>
          ) : (
            <a
              href={`/api/download/free/${target.id}`}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent px-7 text-base font-semibold text-accent-foreground transition hover:opacity-90 sm:w-auto"
            >
              <Download size={18} /> Download free
            </a>
          )}
        </div>

        {target.isPremium && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted sm:justify-start">
            <ShieldCheck size={14} className="shrink-0 text-emerald-400" />
            The “Aurava” watermark is on this preview only — your download is watermark-free.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
