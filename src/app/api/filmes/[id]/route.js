import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const caminhoArquivo = path.join(process.cwd(), 'data', 'filmes_usuario.json');

async function lerBD() {
    try {
        const dadosPuros = await fs.readFile(caminhoArquivo, 'utf-8');
        return JSON.parse(dadosPuros);
    } catch (error) {
        return [];
    }
}

export async function PUT(request, { params }) {
    const usuarioId = request.headers.get('x-user-id');
    
    try {
        const resolvidos = await params;
        const filmeId = String(resolvidos.id).trim();

        const body = await request.json();
        const todosOsFilmes = await lerBD();

        const indexFilme = todosOsFilmes.findIndex(
            filme => String(filme.id).trim() === filmeId && filme.usuarioId === usuarioId
        );

        if (indexFilme === -1) {
            return NextResponse.json(
                { erro: 'Filme não encontrado na sua lista!' },
                { status: 404 }
            );
        }

        todosOsFilmes[indexFilme].status = "Assistido";
        todosOsFilmes[indexFilme].nota = Number(body.nota);
        todosOsFilmes[indexFilme].comentario = body.comentario;

        await fs.writeFile(caminhoArquivo, JSON.stringify(todosOsFilmes, null, 2), 'utf-8');
        
        return NextResponse.json(
            todosOsFilmes[indexFilme],
            { status: 200 }
        );
    }
    catch (error) {
        return NextResponse.json(
            { erro: "Erro ao atualizar o filme!" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    const usuarioId = request.headers.get('x-user-id');
    
    try {
        const resolvidos = await params;
        const filmeId = String(resolvidos.id).trim();

        const todosOsFilmes = await lerBD();

        const filmeExiste = todosOsFilmes.some(
            filme => String(filme.id).trim() === filmeId && filme.usuarioId === usuarioId
        );

        if (!filmeExiste) {
            return NextResponse.json(
                { erro: "Filme não encontrado!" },
                { status: 404 }
            );
        }

        const arrayFiltrado = todosOsFilmes.filter(
            filme => !(String(filme.id).trim() === filmeId && filme.usuarioId === usuarioId)
        );

        await fs.writeFile(caminhoArquivo, JSON.stringify(arrayFiltrado, null, 2), 'utf-8');
        
        return NextResponse.json(
            { mensagem: "Filme removido com sucesso!" },
            { status: 200 }
        );
    }
    catch (error) {
        return NextResponse.json(
            { erro: "Erro ao deletar o filme!" },
            { status: 500 }
        );
    }
}