import { features } from "../env";
import type { Repository } from "./types";
import { mockRepo } from "./mock";

/**
 * Returns the active repository. Uses Supabase when configured, otherwise the
 * in-memory mock. The Supabase impl is imported lazily so its server-only deps
 * (next/headers) never get pulled into a context that can't provide them.
 */
export async function getRepo(): Promise<Repository> {
  if (features.supabase) {
    const { supabaseRepo } = await import("./supabase-repo");
    return supabaseRepo;
  }
  return mockRepo;
}

export type { Repository } from "./types";
