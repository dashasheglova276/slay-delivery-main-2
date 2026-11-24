import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contentTypes: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_request: Request, { params }: { params: { filename: string } }) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse(null, { status: 401 });

  const filename = path.basename(params.filename);
  const extension = filename.split(".").pop() ?? "";
  if (!filename.startsWith(`${user.id}-`) || !contentTypes[extension]) return new NextResponse(null, { status: 404 });

  try {
    const image = await readFile(path.join(process.cwd(), "var", "user-avatars", filename));
    return new NextResponse(image, {
      headers: {
        "Content-Type": contentTypes[extension],
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
