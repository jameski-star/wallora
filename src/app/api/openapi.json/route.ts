import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "Aurava Agent API",
      description: "Machine-readable API for wallpapers, semantic search, display tech blog articles, and visual metadata retrieval on Aurava.",
      version: "1.0.0",
    },
    servers: [
      {
        url: "https://www.auravaw.tech",
        description: "Production Environment",
      },
    ],
    paths: {
      "/api/search": {
        get: {
          summary: "Semantic and Hybrid Search",
          description: "Uses Gemini to parse natural language queries into category, device, media format, and keyword filters, returning matching catalog wallpapers.",
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "The visual/mood query, e.g., 'minimalist mountain range at sunrise'",
            },
          ],
          responses: {
            "200": {
              description: "Parsed intent alongside a list of matching wallpapers.",
            },
          },
        },
      },
      "/api/wallpapers": {
        get: {
          summary: "Query Wallpapers",
          description: "Retrieves wallpapers filtered by device, category, tags, or media types.",
          parameters: [
            { name: "category", in: "query", schema: { type: "string" }, description: "Filter by category slug" },
            { name: "device", in: "query", schema: { type: "string", enum: ["desktop", "phone", "tablet"] } },
            { name: "kind", in: "query", schema: { type: "string", enum: ["image", "live"] }, description: "Still image vs looping live video" },
            { name: "tag", in: "query", schema: { type: "string" } },
            { name: "premium", in: "query", schema: { type: "boolean" }, description: "true for premium, false for free" },
            { name: "sort", in: "query", schema: { type: "string", enum: ["newest", "popular", "price-asc", "price-desc"] } },
            { name: "limit", in: "query", schema: { type: "integer", default: 30 } },
            { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
          ],
          responses: {
            "200": { description: "Array of wallpapers." },
          },
        },
      },
      "/api/categories": {
        get: {
          summary: "List Categories",
          description: "Lists all standard wallpaper categories, names, and descriptions.",
          responses: {
            "200": { description: "Array of categories." },
          },
        },
      },
      "/api/collections": {
        get: {
          summary: "List Curated Collections",
          description: "Exposes pre-curated collections based on tags (e.g. OLED dark mode) and categories.",
          responses: {
            "200": { description: "Array of collection objects." },
          },
        },
      },
      "/api/blog": {
        get: {
          summary: "List Blog Articles",
          description: "Fetches published articles and display guides.",
          responses: {
            "200": { description: "Array of blog posts." },
          },
        },
      },
      "/api/trending": {
        get: {
          summary: "List Trending Wallpapers",
          description: "Returns the most frequently downloaded wallpapers.",
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
          ],
          responses: {
            "200": { description: "Array of trending wallpapers." },
          },
        },
      },
      "/api/latest": {
        get: {
          summary: "List Latest Wallpapers",
          description: "Returns the most recently added wallpapers.",
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer", default: 12 } },
          ],
          responses: {
            "200": { description: "Array of new wallpapers." },
          },
        },
      },
      "/api/colors": {
        get: {
          summary: "List Colors",
          description: "Exposes searchable color indexes and the count of wallpapers in each color group.",
          responses: {
            "200": { description: "Array of indexed colors." },
          },
        },
      },
      "/api/styles": {
        get: {
          summary: "List Design Styles",
          description: "Exposes art styles (minimalist, cyberpunk, line art, etc.) with catalog counts.",
          responses: {
            "200": { description: "Array of indexed design styles." },
          },
        },
      },
      "/api/tags": {
        get: {
          summary: "List All Tags",
          description: "Lists all tags used across the catalog with counts.",
          responses: {
            "200": { description: "Array of tags sorted by frequency." },
          },
        },
      },
      "/api/related": {
        get: {
          summary: "Get Related Wallpapers",
          description: "Returns similar wallpapers based on theme, tags, and category of the requested wallpaper.",
          parameters: [
            { name: "id", in: "query", schema: { type: "string" }, description: "Target wallpaper ID" },
            { name: "slug", in: "query", schema: { type: "string" }, description: "Target wallpaper slug" },
          ],
          responses: {
            "200": { description: "Array of related wallpapers." },
          },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
