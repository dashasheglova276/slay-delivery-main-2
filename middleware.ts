import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware выполняется в Edge-рантайме, где недоступен Prisma Client
 * (нужен Node.js). Поэтому здесь только быстрая проверка "есть ли вообще
 * cookie сессии" — если её нет, сразу редиректим на /login. Проверку роли
 * (ADMIN для /admin, COURIER для /courier) делает сама страница/layout
 * через getCurrentUser() (см. src/app/admin/layout.tsx и src/app/courier/layout.tsx),
 * т.к. там уже доступен полноценный Node.js рантайм с Prisma.
 */
const SESSION_COOKIE = "slay_session";

export function middleware(request: NextRequest) {
  const isProtected = request.nextUrl.pathname.startsWith("/admin") || request.nextUrl.pathname.startsWith("/courier");
  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/courier/:path*"]
};
