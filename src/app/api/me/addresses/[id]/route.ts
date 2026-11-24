export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateAddress, deleteAddress } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

  const body = await request.json();
  try {
    const address = await updateAddress(user.id, params.id, body);
    return NextResponse.json({ address });
  } catch (error) {
    await logError("api/me/addresses/[id] PATCH", error);
    return NextResponse.json({ error: "Адрес не найден" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

  try {
    await deleteAddress(user.id, params.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("api/me/addresses/[id] DELETE", error);
    return NextResponse.json({ error: "Адрес не найден" }, { status: 404 });
  }
}
