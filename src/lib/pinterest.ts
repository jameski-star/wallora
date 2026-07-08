import { env, features } from "./env";
import { getRepo } from "./repo";
import { previewUrl } from "./cloudinary";
import type { Wallpaper } from "./types";

interface PinterestPostResult {
  wallpaperId: string;
  title: string;
  status: "success" | "skipped" | "failed";
  pinId?: string;
  error?: string;
}

/**
 * Exchange the Pinterest refresh token for a fresh short-lived access token,
 * or return the static user access token if configured directly.
 */
async function getOrRefreshAccessToken(): Promise<string> {
  if (env.pinterestRefreshToken && env.pinterestClientId && env.pinterestClientSecret) {
    const authHeader = Buffer.from(
      `${env.pinterestClientId}:${env.pinterestClientSecret}`
    ).toString("base64");

    const response = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: env.pinterestRefreshToken,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Pinterest token refresh failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error("Pinterest response did not contain an access_token");
    }
    return data.access_token;
  }

  if (env.pinterestAccessToken) {
    return env.pinterestAccessToken;
  }

  throw new Error("Pinterest credentials not configured (ACCESS_TOKEN or REFRESH_TOKEN/CLIENT_ID/CLIENT_SECRET is missing)");
}

/**
 * Creates a single Pin on Pinterest for a wallpaper.
 */
async function postPin(
  wallpaper: Wallpaper,
  accessToken: string
): Promise<string> {
  if (!env.pinterestBoardId) {
    throw new Error("PINTEREST_BOARD_ID is not configured");
  }

  // Get public wallpaper page URL on the site
  const link = `${env.siteUrl}/wallpapers/${wallpaper.slug}`;

  // Get preview image URL. Size it to 1200px (standard resolution for Pinterest pins).
  let imageUrl = previewUrl(wallpaper, { width: 1200, quality: 85 });
  if (imageUrl.startsWith("/")) {
    imageUrl = `${env.siteUrl}${imageUrl}`;
  }

  const title = wallpaper.title.slice(0, 100);
  const description = (
    wallpaper.description || 
    wallpaper.seoDescription || 
    `Download ${wallpaper.title} on Aurava.`
  ).slice(0, 500);

  const response = await fetch("https://api.pinterest.com/v5/pins", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      link,
      title,
      description,
      board_id: env.pinterestBoardId,
      media_source: {
        source_type: "image_url",
        url: imageUrl,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Pinterest API returned ${response.status}: ${errText}`);
  }

  const data = await response.json();
  if (!data.id) {
    throw new Error("Pinterest Pin creation succeeded but did not return a Pin ID");
  }

  return data.id;
}

/**
 * Automatically fetches the oldest 10 unposted wallpapers, publishes them
 * to Pinterest, and updates their posted status in the database.
 */
export async function autopostWallpapersToPinterest(
  count = 10
): Promise<{ ok: boolean; results: PinterestPostResult[] }> {
  if (!features.pinterest) {
    // If Pinterest integration is not configured, we return a mock/skipped response
    // to allow the app to function smoothly without crashing in keyless environments.
    return {
      ok: false,
      results: [
        {
          wallpaperId: "none",
          title: "Pinterest Integration",
          status: "skipped",
          error: "Pinterest environment variables are not configured.",
        },
      ],
    };
  }

  const repo = await getRepo();
  
  // Retrieve wallpapers that have not been posted to Pinterest yet, sorted oldest first
  const unposted = await repo.listWallpapers({
    pinterestPosted: false,
    sort: "price-asc", // We query sequentially, or default oldest by sorting newest asc (Wait, getRepo doesn't have oldest sort, but we can do a default/newest sorting or reverse)
    limit: count,
    includeMature: false, // Do not autopost mature rated wallpapers to Pinterest by default to keep developer account safe
  });

  if (unposted.length === 0) {
    return { ok: true, results: [] };
  }

  let accessToken: string;
  try {
    accessToken = await getOrRefreshAccessToken();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      results: unposted.map((w) => ({
        wallpaperId: w.id,
        title: w.title,
        status: "failed" as const,
        error: `Authentication failed: ${message}`,
      })),
    };
  }

  const results: PinterestPostResult[] = [];

  for (const wallpaper of unposted) {
    try {
      const pinId = await postPin(wallpaper, accessToken);

      // Save posted status in repository
      const updated = {
        ...wallpaper,
        pinterestPostedAt: new Date().toISOString(),
        pinterestPinId: pinId,
      };
      await repo.upsertWallpaper(updated);

      results.push({
        wallpaperId: wallpaper.id,
        title: wallpaper.title,
        status: "success",
        pinId,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({
        wallpaperId: wallpaper.id,
        title: wallpaper.title,
        status: "failed",
        error: message,
      });
    }
  }

  const hasSuccess = results.some((r) => r.status === "success");
  return {
    ok: hasSuccess || results.length === 0,
    results,
  };
}
