import { env } from "./env";

/**
 * Notifies search engines (Bing, Yandex, etc.) of new or updated URLs via the IndexNow API.
 */
export async function notifyIndexNow(urls: string[]): Promise<boolean> {
  if (urls.length === 0) return false;
  
  const siteUrl = env.siteUrl.replace(/\/$/, "");
  const host = new URL(siteUrl).host;
  const key = process.env.INDEXNOW_KEY || "auravaindexnowkey2026";
  const keyLocation = `${siteUrl}/${key}.txt`;

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        host,
        key,
        keyLocation,
        urlList: urls,
      }),
    });
    
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.warn(`IndexNow submission failed with status ${res.status}: ${detail}`);
      return false;
    }
    
    console.log(`IndexNow notified successfully for: ${urls.join(", ")}`);
    return true;
  } catch (err) {
    console.error("IndexNow submission error:", err);
    return false;
  }
}
