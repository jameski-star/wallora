import "server-only";
import { env, features } from "./env";
import { abs } from "./seo";

/**
 * PesaPal v3 REST client. SERVER-ONLY — keys are never exposed to the browser.
 *
 * Flow: RequestToken → (RegisterIPN) → SubmitOrderRequest → redirect user →
 * IPN webhook → GetTransactionStatus → fulfill.
 *
 * When PesaPal isn't configured, a mock implementation simulates the redirect
 * + an immediately-"Completed" status so the entire checkout/fulfillment path
 * is exercisable locally.
 */

export interface SubmitOrderInput {
  merchantRef: string;
  amount: number; // major units (e.g. 4.99)
  currency: string;
  description: string;
  email: string;
}

export interface SubmitOrderResult {
  orderTrackingId: string;
  merchantReference: string;
  redirectUrl: string;
}

async function getToken(): Promise<string> {
  const res = await fetch(`${env.pesapalBaseUrl}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: env.pesapalConsumerKey,
      consumer_secret: env.pesapalConsumerSecret,
    }),
    cache: "no-store",
  });
  const data = (await res.json()) as { token?: string; error?: unknown };
  if (!data.token) throw new Error("PesaPal auth failed");
  return data.token;
}

export async function submitOrder(
  input: SubmitOrderInput,
): Promise<SubmitOrderResult> {
  if (!features.pesapal || !env.pesapalIpnId) {
    // Mock: route the user to our own simulated payment page.
    return {
      orderTrackingId: `mock_${input.merchantRef}`,
      merchantReference: input.merchantRef,
      redirectUrl: abs(`/checkout/mock?ref=${encodeURIComponent(input.merchantRef)}`),
    };
  }

  const token = await getToken();
  const res = await fetch(
    `${env.pesapalBaseUrl}/api/Transactions/SubmitOrderRequest`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: input.merchantRef,
        currency: input.currency,
        amount: input.amount,
        description: input.description.slice(0, 100),
        callback_url: abs("/checkout/callback"),
        notification_id: env.pesapalIpnId,
        billing_address: { email_address: input.email },
      }),
      cache: "no-store",
    },
  );
  const data = (await res.json()) as {
    order_tracking_id?: string;
    merchant_reference?: string;
    redirect_url?: string;
    error?: unknown;
  };
  if (!data.redirect_url || !data.order_tracking_id) {
    throw new Error("PesaPal SubmitOrderRequest failed");
  }
  return {
    orderTrackingId: data.order_tracking_id,
    merchantReference: data.merchant_reference ?? input.merchantRef,
    redirectUrl: data.redirect_url,
  };
}

export type PesaPalStatus = "completed" | "pending" | "failed" | "invalid";

export async function getTransactionStatus(
  orderTrackingId: string,
): Promise<PesaPalStatus> {
  if (!features.pesapal || orderTrackingId.startsWith("mock_")) {
    return "completed"; // demo mode auto-confirms
  }
  const token = await getToken();
  const res = await fetch(
    `${env.pesapalBaseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
    {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  const data = (await res.json()) as {
    payment_status_description?: string;
    status_code?: number;
  };
  const desc = (data.payment_status_description ?? "").toLowerCase();
  if (desc === "completed") return "completed";
  if (desc === "failed") return "failed";
  if (desc === "invalid") return "invalid";
  return "pending";
}

/** Register an IPN URL with PesaPal (run once; store the returned id in env). */
export async function registerIpn(): Promise<{ ipn_id: string; url: string }> {
  const token = await getToken();
  const res = await fetch(
    `${env.pesapalBaseUrl}/api/URLSetup/RegisterIPN`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: abs("/api/pesapal/ipn"),
        ipn_notification_type: "GET",
      }),
      cache: "no-store",
    },
  );
  return (await res.json()) as { ipn_id: string; url: string };
}
