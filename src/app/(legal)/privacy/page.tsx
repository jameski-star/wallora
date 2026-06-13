import type { Metadata } from "next";
import {
  SITE_NAME,
  LEGAL_ENTITY,
  SITE_CONTACT_EMAIL,
  LEGAL_JURISDICTION,
  LEGAL_LAST_UPDATED,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>Last updated: {LEGAL_LAST_UPDATED}</p>

      <p>
        This Privacy Policy explains how {LEGAL_ENTITY} (&ldquo;we&rdquo;)
        collects, uses, and protects your personal information when you use{" "}
        {SITE_NAME} (the &ldquo;Service&rdquo;).
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li>
          <strong>Account information</strong> — email address, display name,
          and date of birth (used to verify eligibility for age-restricted
          content).
        </li>
        <li>
          <strong>Order information</strong> — the items you purchase, amounts,
          currency, and payment status. Payments are handled by PesaPal; we
          receive confirmation and references but do not store full card or
          mobile-money details.
        </li>
        <li>
          <strong>Technical data</strong> — limited information needed to operate
          the Service securely, such as session cookies and basic request logs.
        </li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>to provide the Service, process orders, and deliver downloads;</li>
        <li>to maintain your account and purchase history (if you create an account);</li>
        <li>to enforce age-gating for mature content;</li>
        <li>to send transactional messages such as receipts (where you provide an email);</li>
        <li>to secure the Service, prevent abuse, and comply with legal obligations.</li>
      </ul>

      <h2>3. Cookies</h2>
      <p>
        We use cookies that are necessary for authentication, cart, and session
        management. These are required for the Service to function and are not
        used for third-party advertising.
      </p>

      <h2>4. Sharing &amp; third parties</h2>
      <p>
        We share data only as needed to run the Service, including with our
        payment processor (PesaPal), hosting and database providers, and image
        delivery providers. We do not sell your personal information.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We retain account and order records for as long as your account is active
        or as needed to provide the Service and meet legal, accounting, or
        reporting requirements.
      </p>

      <h2>6. Your rights</h2>
      <p>
        Subject to applicable law, you may request access to, correction of, or
        deletion of your personal information, and you may close your account. To
        make a request, contact us using the details below.
      </p>

      <h2>7. Security</h2>
      <p>
        We use reasonable technical and organizational measures to protect your
        information. Original files are stored privately and delivered only via
        short-lived, signed links. No method of transmission or storage is
        completely secure, however, and we cannot guarantee absolute security.
      </p>

      <h2>8. Children</h2>
      <p>
        The Service is not directed to children below the age required to consent
        to processing under {LEGAL_JURISDICTION} law. We do not knowingly collect
        information from such children.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update this Policy from time to time. Changes are indicated by the
        &ldquo;Last updated&rdquo; date above.
      </p>

      <h2>10. Contact</h2>
      <p>
        For privacy questions or requests, email{" "}
        <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a>.
      </p>
    </>
  );
}
