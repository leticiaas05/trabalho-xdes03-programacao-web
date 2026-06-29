import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const caminhoArquivo = path.join(process.cwd(), 'data', 'filmes_usuario.json');

async function lerBD() {
    try {
        const dadosPuros = await fs.readFile(caminhoArquivo, 'utf-8');
        return JSON.parse(dadosPuros);
    } catch {
        return [];
    }
}

//Atualizar status, nota e comentário
export async function PUT(request, {params}){
    const usuarioId = request.headers.get('x-user-id');
    const { id: filmeId } = await params;

    try{
        const body = await request.json();
        const todosOsFilmes = await lerBD();

        //busca o index do filme, com a garantia de que ele pertence ao usuário logado
        const indexFilme = todosOsFilmes.findIndex(
            filme => filme.id === filmeId && filme.usuarioId === usuarioId
        );

        if(indexFilme === -1){
            return NextResponse.json(
                {erro: 'Filme não encontrado na sua lista!'},
                {status: 404}
            );
        }

        todosOsFilmes[indexFilme].status = "Assistido";
        todosOsFilmes[indexFilme].nota = Number(body.nota);
        todosOsFilmes[indexFilme].comentario = body.comentario;

        await fs.writeFile(caminhoArquivo, JSON.stringify(todosOsFilmes, null, 2), 'utf-8');
        return NextResponse.json(
            todosOsFilmes[indexFilme],
            {status: 200}
        );
    }
    catch{
        return NextResponse.json(
            {erro: "Erro ao atualizar o filme!"},
            {status: 500}
        )
    }
}

//remover filme da lista
export async function DELETE(request, {params}) {
    const usuarioId = request.headers.get('x-user-id');
    const { id: filmeId } = await params;

    try{
        const todosOsFilmes = await lerBD();

        const filmeExiste = todosOsFilmes.some(
            filme => filme.id === filmeId && filme.usuarioId === usuarioId
        );

        if(!filmeExiste){
            return NextResponse.json(
                {erro: "Filme não encontrado!"},
                {status: 404}
            );
        }

        //pega todos os filmes, exceto o que será excluido (filter reverso)
        const arrayFiltrado = todosOsFilmes.filter(
            filme => !(filme.id === filmeId && filme.usuarioId === usuarioId)
        );

        await fs.writeFile(caminhoArquivo, JSON.stringify(arrayFiltrado, null, 2), 'utf-8');
        return NextResponse.json(
            {mensagem: "Filme removido com sucesso!"},
            {status: 200}
        );
    }
    catch{
        return NextResponse.json(
            {erro: "Erro ao deletar o filme."},
            {status: 500}
        )
    }
}
