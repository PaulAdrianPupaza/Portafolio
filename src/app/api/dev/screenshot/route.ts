import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Development only: the studio renders README screenshots with the engine and
 * posts each JPEG here, saved as `docs/screenshots/<name>.jpg`. 404 in production.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return new Response(null, { status: 404 });
  const name = new URL(request.url).searchParams.get("name") ?? "";
  if (!/^[a-z0-9-]{1,40}$/.test(name)) return new Response("Invalid name", { status: 400 });

  const jpeg = Buffer.from(await request.arrayBuffer());
  const isJpeg = jpeg[0] === 0xff && jpeg[1] === 0xd8;
  if (!isJpeg || jpeg.length > 5_000_000) return new Response("Expected a JPEG under 5 MB", { status: 400 });

  const dir = path.join(process.cwd(), "docs", "screenshots");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${name}.jpg`), jpeg);
  return Response.json({ saved: `docs/screenshots/${name}.jpg`, bytes: jpeg.length });
}
