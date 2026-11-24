import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { phonesMatch } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function authorize(orderId: string) {
  const user = await getCurrentUser();
  if (!user) return { response: NextResponse.json({ error: "Войдите в аккаунт" }, { status: 401 }) };
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { response: NextResponse.json({ error: "Заказ не найден" }, { status: 404 }) };
  const isCustomer = user.role === "CUSTOMER" && (
    order.customerId === user.id || phonesMatch(order.customerPhone, user.phone)
  );
  const isCourier = user.role === "COURIER" && order.courierId === user.id;
  const allowed = user.role === "ADMIN" || isCustomer || isCourier;
  if (!allowed) return { response: NextResponse.json({ error: "Нет доступа к переписке этого заказа" }, { status: 403 }) };
  return { user, order };
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const access = await authorize(params.id);
  if ("response" in access) return access.response;

  const [rows, courier] = await Promise.all([
    prisma.orderMessage.findMany({ where: { orderId: params.id }, orderBy: { createdAt: "asc" } }),
    access.order.courierId
      ? prisma.user.findUnique({ where: { id: access.order.courierId }, select: { name: true, phone: true } })
      : null
  ]);
  const senderIds = [...new Set(rows.map((message) => message.senderId))];
  const senders = senderIds.length
    ? await prisma.user.findMany({ where: { id: { in: senderIds } }, select: { id: true, name: true, role: true } })
    : [];
  const senderById = new Map(senders.map((sender) => [sender.id, sender]));
  const messages = rows.map((message) => {
    const sender = senderById.get(message.senderId);
    const senderRole = sender?.role
      ?? (message.senderId === access.order.courierId ? "COURIER" : "CUSTOMER");
    return {
      ...message,
      senderName: sender?.name ?? "Пользователь",
      senderRole
    };
  });

  return NextResponse.json({ messages, courier });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const access = await authorize(params.id);
  if ("response" in access) return access.response;
  const body = await request.json();
  const text = String(body.body || "").trim();
  if (!text || text.length > 1000) {
    return NextResponse.json({ error: "Сообщение пустое или слишком длинное" }, { status: 400 });
  }
  const message = await prisma.orderMessage.create({
    data: { orderId: params.id, senderId: access.user.id, body: text }
  });
  return NextResponse.json({
    message: {
      ...message,
      senderName: access.user.name,
      senderRole: access.user.role
    }
  }, { status: 201 });
}
