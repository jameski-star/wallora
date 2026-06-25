import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { env, features } from "@/lib/env";

/**
 * Upload an image file from the admin dashboard to Cloudinary.
 *
 * The admin picks a file in the browser; this route receives it, generates a
 * signed upload request to Cloudinary's Upload API, and proxies the result
 * back — returning the public id + dimensions so the form can auto-fill.
 *
 * Admin-only (gated by `requireAdmin`).
 */
export async function POST(request: NextRequest) {
  await requireAdmin();

  if (!features.cloudinaryAdmin) {
    return NextResponse.json(
      { error: "Cloudinary Admin API not configured — set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET." },
      { status: 400 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  // Only accept image types.
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: `Unsupported file type "${file.type}". Only images are allowed.` },
      { status: 400 },
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }

  // Cloudinary signed upload: the signature covers every parameter EXCEPT
  // `file`, `api_key`, `cloud_name`, and `resource_type`.
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `timestamp=${timestamp}${env.cloudinaryApiSecret}`;
  const signature = createHash("sha1").update(toSign).digest("hex");

  // Forward the file to Cloudinary's Upload API.
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", env.cloudinaryApiKey!);
  body.append("timestamp", String(timestamp));
  body.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloud}/image/upload`,
    { method: "POST", body },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      {
        error: `Cloudinary upload failed (${res.status}). ${text.slice(0, 300)}`,
      },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    public_id: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    secure_url: string;
  };

  return NextResponse.json({
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
    url: data.secure_url,
  });
}

// Next.js App Router route handlers stream the body natively — no config needed.
