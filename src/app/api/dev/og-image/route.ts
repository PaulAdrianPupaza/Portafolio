import { writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Development only: the studio renders the share image with the animation
 * engine and posts the PNG here, which saves it as the Open Graph and Twitter
 * images for every locale. Returns 404 in production.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  const png = Buffer.from(await request.arrayBuffer());
  const isPng = png.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (!isPng || png.length > 5_000_000) return new Response("Expected a PNG under 5 MB", { status: 400 });

  const dir = path.join(process.cwd(), "src", "app", "[locale]");
  await Promise.all([
    writeFile(path.join(dir, "opengraph-image.png"), png),
    writeFile(path.join(dir, "twitter-image.png"), png),
  ]);
  return Response.json({ saved: ["opengraph-image.png", "twitter-image.png"], bytes: png.length });
}
