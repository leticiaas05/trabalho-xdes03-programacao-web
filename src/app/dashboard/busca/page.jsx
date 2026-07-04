'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Simulação de dados que o TMDB devolveria na busca
// Substitua o array do topo do seu arquivo src/app/dashboard/busca/page.jsx por este:
// Substitua o array do topo do seu arquivo src/app/dashboard/busca/page.jsx por este:


export default function BuscaTMDB() {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados do Novo Modal de Inserção Direta para Assistidos
  const [filmeParaAvaliar, setFilmeParaAvaliar] = useState(null);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');

  const router = useRouter();

  // Simula a busca na base do TMDB
  // Substitua a antiga função handleBuscar por esta versão real conectada à API:
  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!termo.trim()) return;

    setLoading(true);
    try {
      // Faz a requisição para a nossa rota ponte passando o termo digitado
      const res = await fetch(`/api/tmdb/busca?query=${encodeURIComponent(termo)}`);
      
      if (!res.ok) {
        const dadosErro = await res.json();
        throw new Error(dadosErro.erro || 'Erro ao buscar filmes.');
      }

      const filmesDoTMDB = await res.json();
      setResultados(filmesDoTMDB);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // DISPARA O POST REAL PARA A SUA API
  const salvarNoBackEnd = async (corpoRequisicao, tituloFilme) => {
    try {
      const res = await fetch('/api/filmes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpoRequisicao)
      });

      const dados = await res.json();

      if (!res.ok) {
        throw new Error(dados.erro || 'Erro ao adicionar filme.');
      }

      alert(`"${tituloFilme}" foi adicionado com sucesso ao seu Sétima Crítica!`);
      
      // Limpa o modal caso estivesse aberto
      setFilmeParaAvaliar(null);
      setComentario('');
      setNota(5);
    } catch (err) {
      alert(err.message);
    }
  };

  // Fluxo 1: Adicionar direto na Wishlist (Sem Modal)
  const handleWishlistDireto = (filmeTMDB) => {
    const mapaCorpo = {
      tmdbId: filmeTMDB.id,
      titulo: filmeTMDB.title,
      cartaz: filmeTMDB.poster_path, // <--- GARANTA QUE ESTÁ EXATAMENTE ASSIM
      status: 'Wishlist'
    };
    salvarNoBackEnd(mapaCorpo, filmeTMDB.title);
  };

  // Fluxo 2: Envio do formulário do Modal (Quando já assistiu)
  const handleEnviarComAvaliacao = (e) => {
    e.preventDefault();
    
    const mapaCorpo = {
      tmdbId: filmeParaAvaliar.id,
      titulo: filmeParaAvaliar.title,
      cartaz: filmeParaAvaliar.poster_path, // <--- GARANTA QUE ESTÁ EXATAMENTE ASSIM
      status: 'Assistido',
      nota: nota,
      comentario: comentario
    };

    salvarNoBackEnd(mapaCorpo, filmeParaAvaliar.title);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      
      {/* BARRA SUPERIOR */}
      <nav className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black tracking-wider">
            Sétima<span className="text-red-600">Crítica</span>
          </h1>
          <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">
            ← Voltar ao Painel
          </Link>
        </div>
      </nav>

      {/* CONTEÚDO */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold mb-2">Expandir Catálogo</h2>
          <p className="text-neutral-400 text-sm">Pesquise filmes na base do TMDB para alimentar sua lista pessoal.</p>
        </div>

        {/* FORMULÁRIO DE BUSCA */}
        <form onSubmit={handleBuscar} className="flex gap-3 max-w-2xl mx-auto mb-12">
          <input
            type="text"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Digite o nome de um filme (ex: Clube da Luta, A Origem...)"
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600 transition-colors shadow-inner"
          />
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 rounded-xl transition-colors cursor-pointer shadow-lg shadow-red-600/20"
          >
            Buscar
          </button>
        </form>

        {loading && <p className="text-center text-neutral-500">Consultando base do TMDB...</p>}

        {/* GRID DE RESULTADOS DA BUSCA */}
        {!loading && resultados.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {resultados.map((filme) => (
              <div key={filme.id} className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 flex flex-col justify-between shadow-lg">
                
                {/* Imagem do Cartaz */}
                <div className="relative aspect-[2/3] bg-neutral-800">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${filme.poster_path}`}
                    alt={filme.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info e Ações */}
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-base text-neutral-100 line-clamp-1">{filme.title}</h3>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => handleWishlistDireto(filme)}
                      className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold py-2 rounded-lg transition-colors cursor-pointer border border-neutral-700/60"
                    >
                      + Wishlist
                    </button>
                    <button
                      onClick={() => setFilmeParaAvaliar(filme)} // Abre o modal passando o filme clicado
                      className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer shadow-md shadow-red-600/10"
                    >
                      + Já Assisti
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {!loading && termo && resultados.length === 0 && (
          <p className="text-center text-neutral-600 italic">Nenhum resultado simulado para esse termo.</p>
        )}
      </main>

      {/* MODAL DE CRÍTICA IMEDIATA (POST COM STATUS ASSISTIDO) */}
      {filmeParaAvaliar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black mb-1">Adicionar Como Assistido</h2>
            <p className="text-neutral-400 text-xs mb-4">Deixe sua nota e crítica para: <span className="text-white font-semibold">{filmeParaAvaliar.title}</span></p>
            
            <form onSubmit={handleEnviarComAvaliacao} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-2">Sua Nota</label>
                <select 
                  value={nota} 
                  onChange={(e) => setNota(Number(e.target.value))}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-white focus:outline-none focus:border-red-600"
                >
                  <option value="5">★★★★★ (Excelente)</option>
                  <option value="4">★★★★☆ (Muito Bom)</option>
                  <option value="3">★★★☆☆ (Bom / Regular)</option>
                  <option value="2">★★☆☆☆ (Ruim)</option>
                  <option value="1">★☆☆☆☆ (Péssimo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-400 mb-2">Crítica / Comentário</label>
                <textarea
                  required
                  rows="3"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="O que achou do filme?"
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-red-600 placeholder-neutral-600 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFilmeParaAvaliar(null)}
                  className="w-1/2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer shadow-lg shadow-red-600/20"
                >
                  Salvar na Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}