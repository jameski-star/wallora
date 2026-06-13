"use server";

import { z } from "zod";
import { startCheckout } from "@/lib/orders";
import { getViewer } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  ids: z.array(z.string()).min(1, "Your cart is empty"),
});

export type CheckoutResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; error: string };

export async function beginCheckout(
  email: string,
  ids: string[],
): Promise<CheckoutResult> {
  const parsed = schema.safeParse({ email, ids });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const viewer = await getViewer();
    const { redirectUrl } = await startCheckout(
      parsed.data.ids.map((wallpaperId) => ({ wallpaperId })),
      parsed.data.email,
      viewer.profile?.id ?? null,
    );
    return { ok: true, redirectUrl };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Checkout failed",
    };
  }
}
