/**
 * Cloudinary Admin API helpers — listing assets and updating context.
 *
 * Server-only. Requires both CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to be
 * set (distinct from the URL-signing secret; see comments in env.ts).
 *
 * The Search API is used instead of the older Admin API because it supports
 * cursor-based pagination, context-aware queries, and is the recommended path
 * for asset discovery in current Cloudinary docs.
 */

import { env, features } from "./env";

const BASE = `https://api.cloudinary.com/v1_1/${env.cloudinaryCloud}`;

/** A single asset returned by the Search API. */
export interface CloudinaryAsset {
  publicId: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
  createdAt: string;
  bytes: number;
  /** Custom context key/values, if any. */
  context?: Record<string, string>;
}

interface SearchHit {
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  context?: { custom?: Record<string, string> };
}

interface SearchResponse {
  resources: SearchHit[];
  next_cursor?: string;
  total_count: number;
}

/**
 * Build the Basic auth header for Admin API calls.
 */
function authHeader(): string {
  const raw = `${env.cloudinaryApiKey}:${env.cloudinaryApiSecret}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

function headers(): Record<string, string> {
  return {
    Authorization: authHeader(),
    "Content-Type": "application/json",
  };
}

/**
 * Search Cloudinary for image assets.
 *
 * Uses the /resources/search endpoint with cursor-based pagination.
 * Returns all matching resources (up to `maxResults`).
 *
 * When `prefix` is set, only assets whose public id starts with that string
 * are returned — useful for scoping to a folder (e.g. "wallpapers/").
 *
 * When `excludeContextKey` is set, assets whose custom context contains that
 * key are filtered out after fetching (the Search API itself can't exclude on
 * context values, so we post-filter).
 */
export async function searchImages(opts: {
  prefix?: string;
  excludeContextKey?: string;
  maxResults?: number;
}): Promise<CloudinaryAsset[]> {
  if (!features.cloudinaryAdmin) {
    throw new Error(
      "Cloudinary Admin API not configured — set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    );
  }

  const { prefix, excludeContextKey, maxResults = 1000 } = opts;
  const results: CloudinaryAsset[] = [];
  let nextCursor: string | undefined;

  do {
    const body: Record<string, unknown> = {
      expression: `resource_type:image${prefix ? ` AND public_id:${prefix}*` : ""}`,
      max_results: Math.min(maxResults - results.length, 500),
      with_context: true,
      sort_by: [{ created_at: "desc" }],
    };
    if (nextCursor) body.next_cursor = nextCursor;

    const res = await fetch(`${BASE}/resources/search`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Cloudinary search failed (${res.status}): ${text.slice(0, 300)}`,
      );
    }

    const data = (await res.json()) as SearchResponse;
    for (const hit of data.resources) {
      const ctx = hit.context?.custom;
      // Skip assets already marked with the exclusion key.
      if (excludeContextKey && ctx?.[excludeContextKey]) continue;
      results.push({
        publicId: hit.public_id,
        width: hit.width,
        height: hit.height,
        format: hit.format,
        resourceType: hit.resource_type,
        createdAt: hit.created_at,
        bytes: hit.bytes,
        context: ctx,
      });
    }

    nextCursor = data.next_cursor;
  } while (nextCursor && results.length < maxResults);

  return results;
}

/**
 * Set a context key/value on an existing Cloudinary asset.
 *
 * Used to mark assets as imported so they're skipped on subsequent runs.
 * The context is visible in the Cloudinary Media Library.
 */
export async function setAssetContext(
  publicId: string,
  key: string,
  value: string,
): Promise<void> {
  const url = `${BASE}/resources/image/context`;
  const body = {
    public_ids: [publicId],
    context: { [key]: value },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Cloudinary context update failed for "${publicId}" (${res.status}): ${text.slice(0, 300)}`,
    );
  }
}
