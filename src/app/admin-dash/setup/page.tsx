import { features } from "@/lib/env";
import { Badge } from "@/components/ui";
import { RegisterIpnForm, SampleContentForms } from "./setup-client";

/** One-click setup helpers for going live: register the PesaPal IPN and seed
 *  the catalog into Supabase. Both are idempotent and admin-gated. */
export default function AdminSetup() {
  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        One-time helpers for going live. Each step is safe to run more than once.
      </p>

      {/* ── PesaPal IPN ─────────────────────────────────────────────── */}
      <section className="rounded-card border border-border bg-surface p-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">PesaPal IPN webhook</h2>
          <Badge tone={features.pesapal ? "accent" : "neutral"}>
            {features.pesapal ? "keys detected" : "keys missing"}
          </Badge>
        </div>
        <p className="mb-4 text-sm text-muted">
          Registers <code>/api/pesapal/ipn</code> with PesaPal so payments notify
          the app. PesaPal returns an <code>ipn_id</code> — copy it into the{" "}
          <code>PESAPAL_IPN_ID</code> environment variable and redeploy. Run this
          once per environment (and again if your domain changes).
        </p>
        <RegisterIpnForm ready={features.pesapal} />
      </section>

      {/* ── Sample / demo content ───────────────────────────────────── */}
      <section className="rounded-card border border-border bg-surface p-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Demo content</h2>
          <Badge tone={features.supabaseAdmin ? "accent" : "neutral"}>
            {features.supabaseAdmin ? "writes to Supabase" : "in-memory demo"}
          </Badge>
        </div>
        <p className="mb-4 text-sm text-muted">
          Your catalog ships <strong>empty</strong> — no placeholder wallpapers
          are shown to visitors. Use <strong>Load sample content</strong> to
          populate a demo set (sample wallpapers, featured slots and blog posts)
          so you can preview the full experience, then <strong>Clear</strong> it
          before launch and add your own. Sample previews load from public image
          hosts; paid downloads need original files uploaded to the{" "}
          <code>premium-wallpapers</code> bucket at{" "}
          <code>originals/&lt;id&gt;.jpg</code>.
        </p>
        <SampleContentForms />
      </section>
    </div>
  );
}
