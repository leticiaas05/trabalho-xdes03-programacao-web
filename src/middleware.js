import { NextResponse } from "next/server";
import { jwtVerify } from "jose"; //biblioteca otimizada para trabalhar com JWT

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/filmes/:path*'
    ]
};

export async function middleware(request){
    const tokenCookie = request.cookies.get('auth_token');
    const token = tokenCookie?.value;

    const url = request.nextUrl.clone();

    if(!token){
        if(request.pathname.startsWith('/api/'))
            return NextResponse.json(
            { erro: 'Aceso negado. Token de autenticação ausente.'},
            {status: 401}
        );

        url.pathname = '/login';
        return NextResponse.redirect(url)
    }

    try{
        const secretKey = process.env.local.JWT_SECRET;
        const encoder = new TextEncoder();
        const secretKeyEncoded = encoder.encode(secretKey);

        const {payload} = await jwtVerify(token, secretKeyEncoded);

        //para identificação de quem está logado, injeta o id do usuário na header
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.id)
        
        return NextResponse.next({
            request: {
                headers: requestHeaders
            }
        });
    }
    catch (error){
        console.error("Falha na verificação do middleware JWT: ", error.message);

        //token inválido/alterado/expirado
        if(request.nextUrl.pathname.startsWith('/api/')){
            return NextResponse.json(
                {erro: "Sessão inválida ou expirada. Faça login novamente."},
                {status: 401}
            );
        }

        // se o problema for no front, limpa o cookie e redireciona para o login
        url.pathname = '/login';
        const redirectResponse = NextResponse.redirect(url);
        redirectResponse.cookies.delete('auth_token');
        return redirectResponse;
    }

}