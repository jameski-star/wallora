import { NextResponse } from "next/server";
import { listCategories } from "@/lib/catalog";

export async function GET() {
  const categories = await listCategories();

  const curatedCollections = [
    {
      id: "oled-dark",
      name: "OLED Dark Mode",
      description: "True black wallpapers optimized for battery-saving and premium dark setups.",
      type: "tag",
      value: "dark",
    },
    {
      id: "minimalist",
      name: "Minimalist Desktops",
      description: "Distraction-free background configurations with elegant patterns and clean negative space.",
      type: "tag",
      value: "minimalist",
    },
    {
      id: "live-wallpapers",
      name: "Live Loop Backgrounds",
      description: "Mesmerizing looping motions and video animations to bring your lock screen to life.",
      type: "kind",
      value: "live",
    },
    {
      id: "cyberpunk-future",
      name: "Cyberpunk & Tech Aesthetics",
      description: "Futuristic neon grids, glowing code lines, and high-tech digital art creations.",
      type: "tag",
      value: "cyberpunk",
    },
  ];

  const categoryCollections = categories.map((c) => ({
    id: c.slug,
    name: `${c.name} Collection`,
    description: c.description,
    type: "category",
    value: c.slug,
  }));

  return NextResponse.json([...curatedCollections, ...categoryCollections]);
}
