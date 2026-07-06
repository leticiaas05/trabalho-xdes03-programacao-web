import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; // biblioteca otimizada para trabalhar com JWT

export const config = {
    matcher: [
        '/',
        '/((?!auth|_next/static|_next/image|favicon.ico|api/auth|api/tmdb).*)',
        '/api/filmes/:path*'
    ]
};

export async function middleware(request) {
    const tokenCookie = request.cookies.get('auth_token');
    const token = tokenCookie?.value;

    const url = request.nextUrl.clone();
    const { pathname } = request.nextUrl;

    if (!token) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { erro: 'Acesso negado. Token de autenticação ausente.' },
                { status: 401 }
            );
        }

        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
    }

    try {
        const secretKey = process.env.JWT_SECRET || "sua_chave_secreta_super_segura_de_backup";
        const encoder = new TextEncoder();
        const secretKeyEncoded = encoder.encode(secretKey);

        const { payload } = await jwtVerify(token, secretKeyEncoded);

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.id);
        
        return NextResponse.next({
            request: {
                headers: requestHeaders
            }
        });
    }
    catch (error) {
        console.error("Falha na verificação do middleware JWT:", error.message);

        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { erro: "Sessão inválida ou expirada. Faça login novamente." },
                { status: 401 }
            );
        }

        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/auth/login';
        
        const redirectResponse = NextResponse.redirect(loginUrl);
        redirectResponse.cookies.delete('auth_token');
        return redirectResponse;
    }
}