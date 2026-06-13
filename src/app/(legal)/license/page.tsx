import type { Metadata } from "next";
import {
  SITE_NAME,
  LEGAL_ENTITY,
  SITE_CONTACT_EMAIL,
  LEGAL_LAST_UPDATED,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Content License",
  description: `What you may and may not do with wallpapers from ${SITE_NAME}.`,
  alternates: { canonical: "/license" },
};

export default function LicensePage() {
  return (
    <>
      <h1>Content License</h1>
      <p>Last updated: {LEGAL_LAST_UPDATED}</p>

      <p>
        When you download a wallpaper from {SITE_NAME} (whether free or
        purchased), {LEGAL_ENTITY} grants you a limited license to use it under
        the terms below. The wallpaper itself is licensed, not sold; all
        intellectual property rights remain with {LEGAL_ENTITY} or its licensors.
      </p>

      <h2>1. What you may do</h2>
      <ul>
        <li>use the wallpaper for personal, non-commercial purposes;</li>
        <li>set it as a background on devices you own or control;</li>
        <li>keep personal backup copies for your own use.</li>
      </ul>

      <h2>2. What you may not do</h2>
      <ul>
        <li>resell, redistribute, sublicense, share, or offer the file for download elsewhere;</li>
        <li>use it in a commercial product, advertisement, or for-sale item without a separate commercial license;</li>
        <li>claim authorship, or register or trademark the work;</li>
        <li>use low-resolution previews as final assets, or attempt to reconstruct the original from them;</li>
        <li>use the work in any unlawful, defamatory, or infringing manner.</li>
      </ul>

      <h2>3. Free wallpapers</h2>
      <p>
        Wallpapers offered free of charge are provided under the same personal-use
        terms above unless their product page states otherwise.
      </p>

      <h2>4. Commercial use</h2>
      <p>
        Need to use a wallpaper commercially (for example, in an app, product, or
        marketing)? Contact us at{" "}
        <a href={`mailto:${SITE_CONTACT_EMAIL}`}>{SITE_CONTACT_EMAIL}</a> to
        arrange a commercial license. No commercial rights are granted by a
        standard purchase.
      </p>

      <h2>5. Termination</h2>
      <p>
        This license terminates automatically if you breach its terms. On
        termination you must stop using and delete the affected files. The
        restrictions in section 2 survive termination.
      </p>
    </>
  );
}
