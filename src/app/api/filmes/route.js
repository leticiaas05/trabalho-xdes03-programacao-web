import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const caminhoArquivo = path.join(process.cwd(), "data", "filmes_usuario.json");

async function lerBD() {
  try {
    const dadosPuros = await fs.readFile(caminhoArquivo, "utf-8");
    return JSON.parse(dadosPuros);
  } catch {
    return [];
  }
}

export async function GET(request) {
  const usuarioId = request.headers.get("x-user-id");

  try {
    const todosOsFilmes = await lerBD();
    const filmesDoUsuario = todosOsFilmes.filter(
      (filme) => filme.usuarioId === usuarioId
    );

    return NextResponse.json(filmesDoUsuario, { status: 200 });
  } catch {
    return NextResponse.json(
      { erro: "Erro ao ler a lista de filmes." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const usuarioId = request.headers.get("x-user-id");

  try {
    const body = await request.json();

    if (!body.tmdbId || !body.titulo) {
      return NextResponse.json(
        { erro: "Dados do TMDB incompletos." },
        { status: 400 }
      );
    }

    const todosOsFilmes = await lerBD();
    const filmeJaAdicionado = todosOsFilmes.some(
      (filme) => filme.usuarioId === usuarioId && filme.tmdbId === Number(body.tmdbId)
    );

    if (filmeJaAdicionado) {
      return NextResponse.json(
        { erro: "O filme ja esta na sua lista!" },
        { status: 400 }
      );
    }

    const status = body.status === "Assistido" ? "Assistido" : "Wishlist";
    const novoFilme = {
      id: crypto.randomUUID(),
      usuarioId,
      tmdbId: Number(body.tmdbId),
      titulo: body.titulo,
      cartaz: body.cartaz || null,
      status,
      nota: status === "Assistido" ? Number(body.nota || 0) : 0,
      comentario: status === "Assistido" ? body.comentario || "" : "",
    };

    todosOsFilmes.push(novoFilme);

    await fs.writeFile(
      caminhoArquivo,
      JSON.stringify(todosOsFilmes, null, 2),
      "utf-8"
    );

    return NextResponse.json(novoFilme, { status: 201 });
  } catch {
    return NextResponse.json(
      { erro: "Erro ao salvar o filme." },
      { status: 500 }
    );
  }
}
