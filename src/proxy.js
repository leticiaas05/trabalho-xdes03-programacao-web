import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const loginPath = "/auth/login";
const segredoJWT = process.env.segredoJWD || "secret_key_desenvolvimento";

export const config = {
  matcher: ["/dashboard/:path*", "/api/filmes/:path*"],
};

export function proxy(request) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        { erro: "Acesso negado. Token de autenticacao ausente." },
        { status: 401 }
      );
    }

    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  try {
    const payload = jwt.verify(token, segredoJWT);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.id);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    if (isApiRoute) {
      return NextResponse.json(
        { erro: "Sessao invalida ou expirada. Faca login novamente." },
        { status: 401 }
      );
    }

    const response = NextResponse.redirect(new URL(loginPath, request.url));
    response.cookies.delete("auth_token");
    return response;
  }
}
