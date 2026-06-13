import { NextResponse, type NextRequest } from "next/server";
import { fulfillByMerchantRef } from "@/lib/orders";

/**
 * PesaPal IPN (Instant Payment Notification) webhook. PesaPal pings this URL
 * (GET by default) when a transaction's status changes. We verify + fulfill,
 * then echo the acknowledgement payload PesaPal expects.
 *
 * Registered via lib/pesapal.registerIpn() — store the returned id in
 * PESAPAL_IPN_ID.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const orderTrackingId = sp.get("OrderTrackingId") ?? "";
  const merchantRef = sp.get("OrderMerchantReference") ?? "";
  const notificationType = sp.get("OrderNotificationType") ?? "IPNCHANGE";

  let status = 200;
  try {
    if (merchantRef) await fulfillByMerchantRef(merchantRef);
  } catch (e) {
    console.error("[ipn] fulfillment error", e);
    status = 500;
  }

  // PesaPal expects this acknowledgement shape.
  return NextResponse.json({
    orderNotificationType: notificationType,
    orderTrackingId,
    orderMerchantReference: merchantRef,
    status,
  });
}

// Some PesaPal configurations POST instead of GET.
export const POST = GET;
