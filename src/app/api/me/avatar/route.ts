import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const imageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};
const MAX_FILE_SIZE = 3 * 1024 * 1024;
const avatarDirectory = path.join(process.cwd(), "var", "user-avatars");

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Войдите в аккаунт, чтобы добавить фото" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("avatar");
  if (!(file instanceof File)) return NextResponse.json({ error: "Выберите изображение" }, { status: 400 });
  const extension = imageTypes[file.type];
  if (!extension) return NextResponse.json({ error: "Поддерживаются JPG, PNG и WebP" }, { status: 400 });
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Размер изображения должен быть не больше 3 МБ" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const isValidImage = extension === "jpg"
    ? bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    : extension === "png"
      ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  if (!isValidImage) return NextResponse.json({ error: "Файл не похож на изображение выбранного формата" }, { status: 400 });

  const filename = `${user.id}-${randomUUID()}.${extension}`;
  await mkdir(avatarDirectory, { recursive: true });
  await writeFile(path.join(avatarDirectory, filename), bytes);
  const avatarUrl = `/api/me/avatar/${filename}`;
  await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } });

  return NextResponse.json({ avatarUrl });
}
