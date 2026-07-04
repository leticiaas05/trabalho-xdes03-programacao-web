"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function getPosterUrl(cartaz) {
  if (!cartaz) return null;
  if (cartaz.startsWith("http")) return cartaz;
  return `${TMDB_IMAGE_BASE}${cartaz}`;
}

function RecomendadoCard({ filme, onClick }) {
  const posterUrl = getPosterUrl(filme.cartaz);

  return (
    <div className="recommended-card" onClick={onClick}>
      <div className="recommended-poster">
        {posterUrl ? <img src={posterUrl} alt={filme.titulo} /> : <span>{filme.titulo}</span>}
      </div>
      <div className="recommended-overlay">
        <h4>{filme.titulo}</h4>
        <span className="recommended-genre">Adicionar +</span>
      </div>
    </div>
  );
}

function FilmeCard({ filme, onRemove, onOpenReview, isBusy }) {
  const posterUrl = getPosterUrl(filme.cartaz);

  return (
    <article className="movie-card">
      <div className="movie-poster">
        {posterUrl ? (
          <img src={posterUrl} alt={filme.titulo} />
        ) : (
          <span>Sem cartaz</span>
        )}
      </div>

      <div className="movie-info">
        <h3>{filme.titulo}</h3>

        {filme.status === "Assistido" ? (
          <div className="movie-review">
            <strong>★ {filme.nota || 0}/5</strong>
            <p className="movie-comment">&ldquo;{filme.comentario || "Sem comentário."}&rdquo;</p>
          </div>
        ) : (
          <p className="movie-status">Na sua wishlist</p>
        )}

        <div className="movie-actions">
          <button
            type="button"
            className="secondary-button"
            disabled={isBusy}
            onClick={() => onOpenReview(filme)}
          >
            {filme.status === "Assistido" ? "Editar avaliação" : "Já assisti!"}
          </button>

          <button
            type="button"
            className="danger-button"
            disabled={isBusy}
            onClick={() => onRemove(filme)}
          >
            Remover da lista
          </button>
        </div>
      </div>
    </article>
  );
}

export function DashboardClient() {
  const [filmes, setFilmes] = useState([]);
  const [recomendados, setRecomendados] = useState([]);
  const [activeTab, setActiveTab] = useState("Wishlist");
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [reviewMovie, setReviewMovie] = useState(null);
  const [reviewForm, setReviewForm] = useState({ nota: "5", comentario: "" });
  const [selectedRecMovie, setSelectedRecMovie] = useState(null);

  const carrosselRef = useRef(null);

  const moverCarrosselEsquerda = () => {
    if (carrosselRef.current) {
      carrosselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const moverCarrosselDireita = () => {
    if (carrosselRef.current) {
      carrosselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  async function buscarFilmes() {
    const response = await fetch("/api/filmes");
    const data = await response.json();
    if (!response.ok) throw new Error(data.erro || "Não foi possível carregar seus filmes.");
    return Array.isArray(data) ? data : [];
  }

  async function buscarRecomendados() {
    try {
      const response = await fetch("/api/tmdb/recomendacoes");
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setRecomendados(data);
      }
    } catch (err) {
      console.error("Não foi possível carregar as recomendações de filmes:", err);
    } finally {
      setIsLoadingRecs(false);
    }
  }

  async function carregarFilmes() {
    setIsLoading(true);
    setFeedback(null);
    try {
      const data = await buscarFilmes();
      setFilmes(data);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erro ao carregar o dashboard.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function inicializar() {
      buscarRecomendados();
      try {
        const data = await buscarFilmes();
        if (isActive) setFilmes(data);
      } catch (error) {
        if (isActive) {
          setFeedback({
            type: "error",
            message: error instanceof Error ? error.message : "Erro ao carregar o dashboard.",
          });
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    inicializar();
    return () => { isActive = false; };
  }, []);

  const wishlist = useMemo(() => filmes.filter((f) => f.status === "Wishlist"), [filmes]);
  const assistidos = useMemo(() => filmes.filter((f) => f.status === "Assistido"), [filmes]);
  const filmesDaAba = activeTab === "Wishlist" ? wishlist : assistidos;

  async function adicionarDaRecomendacao(status) {
    if (!selectedRecMovie) return;
    
    setFeedback(null);

    if (status === "Wishlist") {
      const filmePayload = {
        tmdbId: selectedRecMovie.idOrigem || selectedRecMovie.id,
        titulo: selectedRecMovie.titulo,
        cartaz: selectedRecMovie.cartaz,
        status: "Wishlist"
      };

      try {
        const response = await fetch("/api/filmes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filmePayload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || "Filme já está na sua lista.");

        setFilmes((atuais) => [...atuais, data]);
        setActiveTab("Wishlist");
        setFeedback({ type: "success", message: `"${filmePayload.titulo}" adicionado à Wishlist!` });
      } catch (error) {
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Erro ao adicionar filme.",
        });
      } finally {
        setSelectedRecMovie(null);
      }
    } else if (status === "Assistido") {
      const filmeTemporario = {
        idOrigem: selectedRecMovie.idOrigem || selectedRecMovie.id,
        titulo: selectedRecMovie.titulo,
        cartaz: selectedRecMovie.cartaz,
        status: "Assistido",
        isNovoRecomendado: true 
      };
      
      setSelectedRecMovie(null); 
      setReviewMovie(filmeTemporario); 
      setReviewForm({ nota: "5", comentario: "" }); 
    }
  }

  async function salvarAvaliacao(event) {
    event.preventDefault();
    if (!reviewMovie) return;

    setFeedback(null);
    const { nota, comentario } = reviewForm;

    if (reviewMovie.isNovoRecomendado) {
      const filmePayload = {
        tmdbId: reviewMovie.idOrigem,
        titulo: reviewMovie.titulo,
        cartaz: reviewMovie.cartaz,
        status: "Assistido",
        nota: Number(nota),
        comentario: comentario.trim()
      };

      try {
        const response = await fetch("/api/filmes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filmePayload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || "Não foi possível salvar o filme.");

        setFilmes((atuais) => [...atuais, data]);
        setActiveTab("Assistido");
        setFeedback({ type: "success", message: `"${filmePayload.titulo}" avaliado e salvo com sucesso!` });
        setReviewMovie(null);
        setReviewForm({ nota: "5", comentario: "" });
      } catch (error) {
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Erro ao salvar o filme assistido.",
        });
      }
    } else {
      setBusyId(reviewMovie.id);
      try {
        const response = await fetch(`/api/filmes/${reviewMovie.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nota: Number(nota),
            comentario: comentario.trim(),
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || "Não foi possível salvar a avaliação.");

        setFilmes((atuais) => atuais.map((f) => (f.id === data.id ? data : f)));
        setActiveTab("Assistido");
        setReviewMovie(null);
        setReviewForm({ nota: "5", comentario: "" });
        setFeedback({ type: "success", message: "Avaliação alterada com sucesso!" });
      } catch (error) {
        setFeedback({
          type: "error",
          message: error instanceof Error ? error.message : "Erro inesperado ao salvar a avaliação.",
        });
      } finally {
        setBusyId(null);
      }
    }
  }

  function abrirModalAvaliacao(filme) {
    setReviewMovie(filme);
    setReviewForm({ nota: String(filme.nota || 5), comentario: filme.comentario || "" });
    setFeedback(null);
  }

  function fecharModalAvaliacao() {
    if (busyId) return;
    setReviewMovie(null);
    setReviewForm({ nota: "5", comentario: "" });
  }

  async function removerFilme(filme) {
    const confirmou = window.confirm(`Remover "${filme.titulo}" da sua lista?`);
    if (!confirmou) return;

    setBusyId(filme.id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/filmes/${filme.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || "Não foi possível remover o filme.");

      setFilmes((atuais) => atuais.filter((item) => item.id !== filme.id));
      setFeedback({ type: "success", message: data.mensagem });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erro inesperado ao remover o filme.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth/login";
  }

  return (
    <main className="dashboard-page">
      <nav className="dashboard-nav">
        <Link href="/" className="brand-logo">
          Sétima<span>Crítica</span>
        </Link>
        <div className="dashboard-nav-actions">
          <Link href="./dashboard/busca" className="primary-button add-button">
            + Adicionar Filme
          </Link>
          <button type="button" className="logout-button" onClick={sair}>
            Sair
          </button>
        </div>
      </nav>

      <section className="dashboard-shell">
        

        

        <header className="dashboard-header">
          <div>
            <p>Meu painel</p>
            <h1>Minha lista de filmes</h1>
          </div>
          <button type="button" className="refresh-button" onClick={carregarFilmes}>
            Atualizar
          </button>
        </header>

        <div className="dashboard-tabs" role="tablist" aria-label="Listas de filmes">
          <button
            type="button"
            className={activeTab === "Wishlist" ? "active" : ""}
            onClick={() => setActiveTab("Wishlist")}
          >
            Quero Assistir <span>{wishlist.length}</span>
          </button>
          <button
            type="button"
            className={activeTab === "Assistido" ? "active" : ""}
            onClick={() => setActiveTab("Assistido")}
          >
            Já Assistidos <span>{assistidos.length}</span>
          </button>
        </div>

        {feedback ? (
          <p className={`dashboard-feedback dashboard-feedback-${feedback.type}`}>
            {feedback.message}
          </p>
        ) : null}

        <section className="movies-section">
          {isLoading ? (
            <p className="empty-state">Carregando seus filmes...</p>
          ) : filmesDaAba.length > 0 ? (
            <div className="movies-grid">
              {filmesDaAba.map((filme) => (
                <FilmeCard
                  key={filme.id}
                  filme={filme}
                  isBusy={busyId === filme.id}
                  onRemove={removerFilme}
                  onOpenReview={abrirModalAvaliacao}
                />
              ))}
            </div>
          ) : (
            <p className="empty-state">
              {activeTab === "Wishlist"
                ? "Sua lista de desejos está vazia."
                : "Você ainda não avaliou nenhum filme."}
            </p>
          )}
        </section>

        <hr className="section-divider" />
        
        <section className="recommended-section">
          <div className="recommended-header">
            <h2 className="section-title">Recomendações da Crítica</h2>
            {recomendados.length > 0 && !isLoadingRecs && (
              <div className="carousel-controls">
                <button type="button" className="carousel-arrow" onClick={moverCarrosselEsquerda}>
                  &#8249;
                </button>
                <button type="button" className="carousel-arrow" onClick={moverCarrosselDireita}>
                  &#8250;
                </button>
              </div>
            )}
          </div>

          {isLoadingRecs ? (
            <p className="movie-status">Buscando tendências no TMDB...</p>
          ) : recomendados.length > 0 ? (
            <div className="carousel-wrapper">
              <div className="recommended-row" ref={carrosselRef}>
                {recomendados.map((filme) => (
                  <RecomendadoCard 
                    key={filme.id} 
                    filme={filme} 
                    onClick={() => setSelectedRecMovie(filme)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="movie-status">Nenhuma recomendação disponível no momento.</p>
          )}
        </section>
      </section>

      {selectedRecMovie ? (
        <div className="modal-backdrop" onClick={() => setSelectedRecMovie(null)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <header>
              <p>Adicionar à sua biblioteca</p>
              <h2>{selectedRecMovie.titulo}</h2>
            </header>
            <p className="movie-status" style={{ margin: "8px 0 16px" }}>
              Onde você deseja salvar este filme nas suas listas do Sétima Crítica?
            </p>
            <div className="modal-actions" style={{ justifyContent: "stretch", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button 
                type="button" 
                className="secondary-button" 
                onClick={() => adicionarDaRecomendacao("Wishlist")}
              >
                + Wishlist
              </button>
              <button 
                type="button" 
                className="primary-button" 
                onClick={() => adicionarDaRecomendacao("Assistido")}
              >
                + Já Assisti
              </button>
            </div>
            <button 
              type="button" 
              className="danger-button" 
              style={{ marginTop: "8px" }}
              onClick={() => setSelectedRecMovie(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {reviewMovie ? (
        <div className="modal-backdrop" role="presentation">
          <form className="review-modal" onSubmit={salvarAvaliacao}>
            <header>
              <p>{reviewMovie.titulo}</p>
              <h2>{reviewMovie.status === "Assistido" && reviewMovie.isNovoRecomendado ? "Escrever crítica" : "Editar crítica"}</h2>
            </header>
            <label>
              Nota
              <select
                value={reviewForm.nota}
                onChange={(e) => setReviewForm((c) => ({ ...c, nota: e.target.value }))}
              >
                <option value="5">★★★★★ (Excelente)</option>
                <option value="4">★★★★☆ (Muito Bom)</option>
                <option value="3">★★★☆☆ (Bom)</option>
                <option value="2">★★☆☆☆ (Ruim)</option>
                <option value="1">★☆☆☆☆ (Péssimo)</option>
              </select>
            </label>
            <label>
              Sua avaliação
              <textarea
                value={reviewForm.comentario}
                rows={4}
                required
                placeholder="Modifique seus comentários sobre o filme..."
                onChange={(e) => setReviewForm((c) => ({ ...c, comentario: e.target.value }))}
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={fecharModalAvaliacao}>
                Cancelar
              </button>
              <button type="submit" className="primary-button">
                Salvar na Lista
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}