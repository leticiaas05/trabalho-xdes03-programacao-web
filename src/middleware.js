import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; // biblioteca otimizada para trabalhar com JWT

export const config = {
    /*
      O matcher agora intercepta:
      1. A raiz '/' (seu novo dashboard)
      2. Qualquer rota que não comece com 'auth', '_next/static', '_next/image', 'favicon.ico', etc.
      3. Todas as rotas de API de filmes
    */
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

    // Se o usuário não tem token
    if (!token) {
        // Se a requisição for para uma rota de API protegida, retorna JSON
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { erro: 'Acesso negado. Token de autenticação ausente.' },
                { status: 401 }
            );
        }

        // Se for uma página visual (como a raiz '/'), redireciona para o login
        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
    }

    try {
        // Pega a variável de ambiente ou usa uma string padrão
        const secretKey = process.env.JWT_SECRET || "sua_chave_secreta_super_segura_de_backup";
        const encoder = new TextEncoder();
        const secretKeyEncoded = encoder.encode(secretKey);

        // Faz a validação do token vindo do cookie
        const { payload } = await jwtVerify(token, secretKeyEncoded);

        // Injeta o ID do usuário verificado no header da requisição
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

        // Se o problema for numa rota de API, retorna erro de sessão
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { erro: "Sessão inválida ou expirada. Faça login novamente." },
                { status: 401 }
            );
        }

        // Se for uma página visual (ex: antiga /dashboard, atual '/'), limpa o cookie e força o login
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/auth/login';
        
        const redirectResponse = NextResponse.redirect(loginUrl);
        redirectResponse.cookies.delete('auth_token');
        return redirectResponse;
    }
}