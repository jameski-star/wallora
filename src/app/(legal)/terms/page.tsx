import type { Metadata } from "next";
import {
  SITE_NAME,
  LEGAL_ENTITY,
  SITE_CONTACT_EMAIL,
  LEGAL_JURISDICTION,
  LEGAL_LAST_UPDATED,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms governing your use of ${SITE_NAME}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>Last updated: {LEGAL_LAST_UPDATED}</p>

      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of{" "}
        {SITE_NAME} (the &ldquo;Service&rdquo;), operated by {LEGAL_ENTITY}{" "}
        (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By creating an
        account, purchasing, or otherwise using the Service, you agree to these
        Terms. If you do not agree, do not use the Service.
      </p>

      <h2>1. Eligibility &amp; accounts</h2>
      <p>
        You must be able to form a binding contract to use the Service. Some
        content is age-restricted; where content is marked mature, you confirm
        you meet the minimum age indicated. You are responsible for the accuracy
        of the information you provide (including your date of birth) and for
        keeping your account credentials secure. You are responsible for all
        activity under your account.
      </p>

      <h2>2. The Service</h2>
      <p>
        {SITE_NAME} is a marketplace for digital wallpapers. Premium previews
        displayed on the Service are reduced in resolution; the original,
        high-resolution file is delivered only after a completed purchase. Items
        expressly offered free of charge are available to download in full.
      </p>

      <h2>3. Purchases &amp; payment</h2>
      <ul>
        <li>
          Prices are shown at checkout and charged in the currency stated there.
          Payments are processed by our third-party payment provider (PesaPal);
          we do not store your full payment details.
        </li>
        <li>
          A purchase is confirmed only once payment is successfully verified.
          Until then, no download is granted.
        </li>
        <li>
          Purchased items are licensed, not sold, to you. See the{" "}
          <a href="/license">Content License</a> for what you may and may not do
          with a wallpaper.
        </li>
      </ul>

      <h2>4. Downloads &amp; delivery</h2>
      <p>
        After a confirmed payment, download links are made available on the order
        confirmation page. These links are time-limited for security. Creating an
        account lets you save your purchases and re-download them at any time.
        Guests may purchase and download without an account, but are responsible
        for retrieving their files while the links are valid.
      </p>

      <h2>5. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>circumvent, disable, or interfere with access controls or other security features;</li>
        <li>scrape, mass-download, resell, redistribute, or sublicense content except as permitted by the Content License;</li>
        <li>use the Service for unlawful purposes or to infringe the rights of others.</li>
      </ul>

      <h2>6. Intellectual property</h2>
      <p>
        All content on the Service, including images, text, and branding, is
        owned by {LEGAL_ENTITY} or its licensors and is protected by applicable
        laws. Except for the limited license granted on purchase, no rights are
        transferred to you.
      </p>

      <h2>7. Disclaimers &amp; limitation of liability</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; without warranties of any
        kind. To the maximum extent permitted by law, {LEGAL_ENTITY} is not
        liable for any indirect, incidental, or consequential damages, and our
        total liability for any claim is limited to the amount you paid for the
        relevant order.
      </p>

      <h2>8. Termination</h2>
      <p>
        We may suspend or terminate access to the Service for any breach of these
        Terms. Licenses for content you have already purchased survive termination
        in accordance with the Content License.
      </p>

      <h2>9. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be
        reflected by updating the &ldquo;Last updated&rdquo; date above. Continued
        use of the Service after changes take effect constitutes acceptance.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of {LEGAL_JURISDICTION}, without
        regard to conflict-of-law principles.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>.
      </p>
    </>
  );
}
