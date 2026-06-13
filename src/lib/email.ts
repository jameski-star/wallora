import "server-only";
import { env, features } from "./env";
import { formatPrice } from "./utils";
import type { Order } from "./types";

/**
 * Transactional email via Resend. When unconfigured, emails are logged to the
 * server console so the fulfillment flow is observable in local dev.
 */

interface DownloadLink {
  title: string;
  url: string;
}

export async function sendReceiptAndDownloads(
  order: Order,
  links: DownloadLink[],
): Promise<void> {
  const subject = `Your Wallora order ${order.id.slice(0, 12)} — download links`;
  const html = receiptHtml(order, links);

  if (!features.resend) {
    console.info(
      `[email:mock] → ${order.email}\n${subject}\n` +
        links.map((l) => `  • ${l.title}: ${l.url}`).join("\n"),
    );
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(env.resendKey);
  await resend.emails.send({
    from: env.emailFrom,
    to: order.email,
    subject,
    html,
  });
}

function receiptHtml(order: Order, links: DownloadLink[]): string {
  const rows = order.items
    .map(
      (it) =>
        `<tr><td style="padding:8px 0;color:#444">${it.title}</td><td style="padding:8px 0;text-align:right">${formatPrice(it.priceCents, order.currency)}</td></tr>`,
    )
    .join("");
  const downloads = links
    .map(
      (l) =>
        `<p style="margin:8px 0"><a href="${l.url}" style="color:#7916ff;font-weight:600">⬇ Download “${l.title}”</a></p>`,
    )
    .join("");
  return `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
    <h1 style="font-size:22px">Thanks for your purchase 🎉</h1>
    <p style="color:#555">Order <strong>${order.id}</strong></p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}
      <tr><td style="padding:12px 0;border-top:1px solid #eee;font-weight:700">Total</td>
      <td style="padding:12px 0;border-top:1px solid #eee;text-align:right;font-weight:700">${formatPrice(order.totalCents, order.currency)}</td></tr>
    </table>
    <h2 style="font-size:16px">Your downloads</h2>
    <p style="color:#888;font-size:13px">Links expire in 60 seconds — re-download anytime from your account.</p>
    ${downloads}
    <p style="color:#999;font-size:12px;margin-top:24px">Wallora — premium wallpapers.</p>
  </div>`;
}
