import { NextResponse } from 'next/server';

// Certifique-se de usar EXPORT ASYNC FUNCTION GET (em maiúsculas)
export async function GET() {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ erro: "Chave do TMDB não configurada no servidor." }, { status: 500 });
    }

    try {
        const urlTMDB = `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=pt-BR`;
        
        const respostaTMDB = await fetch(urlTMDB, { next: { revalidate: 3600 } }); 
        
        if (!respostaTMDB.ok) {
            return NextResponse.json({ erro: "Falha ao consultar o serviço TMDB externo." }, { status: respostaTMDB.status });
        }

        const dados = await respostaTMDB.json();

        if (!dados || !dados.results) {
            return NextResponse.json([], { status: 200 });
        }

        const filmesMapeados = dados.results.slice(0, 10).map((filme) => ({
            id: filme.id.toString(), // garante ID como string se necessário
            idOrigem: filme.id,
            titulo: filme.title || filme.original_title || "Título Desconhecido",
            cartaz: filme.poster_path || null
        }));

        return NextResponse.json(filmesMapeados, { status: 200 });

    } catch (error) {
        console.error("Erro interno na rota de recomendações do TMDB:", error);
        return NextResponse.json(
            { erro: "Erro interno no servidor ao processar recomendações.", detalhe: error.message }, 
            { status: 500 }
        );
    }
}