"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";
import {
  registerPesapalIpnAction,
  loadSampleContentAction,
  clearCatalogAction,
  type SetupResult,
} from "@/app/admin-dash/actions";

function ResultNote({ state }: { state: SetupResult | null }) {
  if (!state) return null;
  return (
    <div
      className={
        "mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm " +
        (state.ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/30 bg-red-500/10 text-red-300")
      }
    >
      {state.ok ? (
        <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
      ) : (
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      )}
      <span className="break-words font-mono text-xs leading-relaxed">
        {state.message}
      </span>
    </div>
  );
}

export function RegisterIpnForm({ ready }: { ready: boolean }) {
  const [state, action, pending] = useActionState(
    registerPesapalIpnAction,
    null,
  );
  return (
    <form action={action}>
      <Button type="submit" size="sm" disabled={pending || !ready}>
        {pending ? "Registering…" : "Register IPN now"}
      </Button>
      <ResultNote state={state} />
    </form>
  );
}

export function SampleContentForms() {
  const [loadState, loadAction, loading] = useActionState(
    loadSampleContentAction,
    null,
  );
  const [clearState, clearAction, clearing] = useActionState(
    clearCatalogAction,
    null,
  );
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <form action={loadAction}>
          <Button type="submit" size="sm" variant="secondary" disabled={loading}>
            {loading ? "Loading…" : "Load sample content"}
          </Button>
        </form>
        <form action={clearAction}>
          <Button type="submit" size="sm" variant="danger" disabled={clearing}>
            {clearing ? "Clearing…" : "Clear all wallpapers & posts"}
          </Button>
        </form>
      </div>
      <ResultNote state={loadState} />
      <ResultNote state={clearState} />
    </div>
  );
}
