import { ImageResponse } from "next/og";

// Apple touch icon (iOS home screen / Safari). Mirrors icon.svg: the amber "A"
// mark on a rounded square. Apple recommends 180×180. Auto-linked as
// <link rel="apple-touch-icon"> by Next's file convention.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const ACCENT = "#E3A53A";
const ACCENT_FG = "#382C1B";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: ACCENT,
          color: ACCENT_FG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 120,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        A
      </div>
    ),
    { ...size },
  );
}
