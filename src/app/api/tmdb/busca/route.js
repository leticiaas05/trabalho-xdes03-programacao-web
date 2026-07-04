import { NextResponse } from 'next/server';

export async function GET(request) {
    // 1. Captura o termo de busca enviado pela URL
    const { searchParams } = new URL(request.url);
    const termo = searchParams.get('query');

    if (!termo) {
        return NextResponse.json({ erro: "Termo de busca ausente." }, { status: 400 });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ erro: "Chave do TMDB não configurada no servidor." }, { status: 500 });
    }

    try {
        const urlTMDB = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(termo)}&page=1&include_adult=false`;
        
        const respostaTMDB = await fetch(urlTMDB);
        
        if (!respostaTMDB.ok) {
            return NextResponse.json({ erro: "Falha ao consultar o serviço TMDB externo." }, { status: respostaTMDB.status });
        }

        // CORREÇÃO CENTRAL: Primeiro esperamos o JSON converter por completo
        const dados = await respostaTMDB.json();

        // Verificação de segurança para garantir que o TMDB retornou a lista de resultados
        if (!dados || !dados.results) {
            return NextResponse.json([], { status: 200 });
        }

        // Mapeamos os filmes limpando os campos para o formato que seu CRUD espera
        const filmesMapeados = dados.results.map((filme) => ({
            id: filme.id,
            title: filme.title || filme.original_title || "Título Desconhecido",
            poster_path: filme.poster_path || null
        }));

        return NextResponse.json(filmesMapeados, { status: 200 });

    } catch (error) {
        console.error("Erro interno na rota de busca do TMDB:", error);
        return NextResponse.json(
            { erro: "Erro interno no servidor ao processar a busca.", detalhe: error.message }, 
            { status: 500 }
        );
    }
}