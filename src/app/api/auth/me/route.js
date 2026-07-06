import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const caminhoUsuarios = path.join(process.cwd(), 'data', 'usuarios.json');

export async function GET(request) {
    const usuarioId = request.headers.get('x-user-id');

    try {
        const dadosPuros = await fs.readFile(caminhoUsuarios, 'utf-8');
        const usuarios = JSON.parse(dadosPuros);

        const usuarioEncontrado = usuarios.find(u => u.id === usuarioId);

        if (!usuarioEncontrado) {
            return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });
        }

        return NextResponse.json({
                id: usuarioEncontrado.id,
                nome: usuarioEncontrado.nome,
                email: usuarioEncontrado.email
            }, 
            { status: 200 }
        );

    } catch (error) {
        return NextResponse.json(
            { erro: "Erro interno no servidor." }, 
            { status: 500 }
        );
    }
}