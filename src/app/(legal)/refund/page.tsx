import type { Metadata } from "next";
import {
  SITE_NAME,
  LEGAL_ENTITY,
  SITE_CONTACT_EMAIL,
  LEGAL_LAST_UPDATED,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: `Refund terms for digital wallpaper purchases on ${SITE_NAME}.`,
  alternates: { canonical: "/refund" },
};

export default function RefundPage() {
  return (
    <>
      <h1>Refund Policy</h1>
      <p>Last updated: {LEGAL_LAST_UPDATED}</p>

      <p>
        {SITE_NAME} sells digital goods (wallpaper files) that are delivered
        immediately after a confirmed payment. Because these products are
        intangible and accessible instantly, the following policy applies to
        purchases made from {LEGAL_ENTITY}.
      </p>

      <h2>1. Digital goods are generally non-refundable</h2>
      <p>
        Once a download link for a purchased item has been made available, the
        sale is considered final and is generally non-refundable. By completing
        checkout you acknowledge that you receive immediate access to the digital
        file and that this may affect any cancellation right that would otherwise
        apply.
      </p>

      <h2>2. When we will provide a refund</h2>
      <p>We will review and, where appropriate, refund in cases such as:</p>
      <ul>
        <li>you were charged more than once for the same order;</li>
        <li>the file is corrupt, materially not as described, or cannot be downloaded due to a fault on our side that we cannot resolve;</li>
        <li>a payment was made in error and the item has not been downloaded.</li>
      </ul>

      <h2>3. What is not eligible</h2>
      <ul>
        <li>change of mind after the file has been downloaded;</li>
        <li>buying the wrong item where a correct equivalent was clearly described;</li>
        <li>incompatibility with your device where the resolution and format were stated on the product page.</li>
      </ul>

      <h2>4. How to request a refund</h2>
      <p>
        Email{" "}
        <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a> within
        14 days of your purchase with your order reference and a description of
        the issue. We aim to respond within a few business days. Approved refunds
        are returned via the original payment method through our payment provider;
        processing times depend on that provider.
      </p>

      <h2>5. Chargebacks</h2>
      <p>
        If you believe a charge is incorrect, please contact us first — we can
        usually resolve issues faster than a formal dispute.
      </p>
    </>
  );
}
