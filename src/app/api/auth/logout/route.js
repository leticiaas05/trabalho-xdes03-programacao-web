import { NextResponse } from 'next/server';

export async function POST() {
    const resposta = NextResponse.json(
        { mensagem: "Deslogado com sucesso!" }, 
        { status: 200 }
    );
    
    resposta.cookies.set('auth_token', '', { expires: new Date(0), path: '/' });
    
    return resposta;
}