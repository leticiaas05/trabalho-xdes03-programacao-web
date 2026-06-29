"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function getPosterUrl(cartaz) {
  if (!cartaz) return null;
  if (cartaz.startsWith("http")) return cartaz;
  return `${TMDB_IMAGE_BASE}${cartaz}`;
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
            <strong>Nota {filme.nota || 0}/5</strong>
            <p>{filme.comentario || "Sem comentario."}</p>
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
            {filme.status === "Assistido" ? "Editar avaliacao" : "Ja assisti"}
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
  const [activeTab, setActiveTab] = useState("Wishlist");
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [reviewMovie, setReviewMovie] = useState(null);
  const [reviewForm, setReviewForm] = useState({ nota: "5", comentario: "" });

  async function buscarFilmes() {
    const response = await fetch("/api/filmes");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || "Nao foi possivel carregar seus filmes.");
    }

    return Array.isArray(data) ? data : [];
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
        message:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao carregar o dashboard.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function carregarInicial() {
      try {
        const data = await buscarFilmes();
        if (isActive) {
          setFilmes(data);
        }
      } catch (error) {
        if (isActive) {
          setFeedback({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "Erro inesperado ao carregar o dashboard.",
          });
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    carregarInicial();

    return () => {
      isActive = false;
    };
  }, []);

  const wishlist = useMemo(
    () => filmes.filter((filme) => filme.status === "Wishlist"),
    [filmes]
  );

  const assistidos = useMemo(
    () => filmes.filter((filme) => filme.status === "Assistido"),
    [filmes]
  );

  const filmesDaAba = activeTab === "Wishlist" ? wishlist : assistidos;

  function abrirModalAvaliacao(filme) {
    setReviewMovie(filme);
    setReviewForm({
      nota: String(filme.nota || 5),
      comentario: filme.comentario || "",
    });
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
      const response = await fetch(`/api/filmes/${filme.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Nao foi possivel remover o filme.");
      }

      setFilmes((filmesAtuais) =>
        filmesAtuais.filter((item) => item.id !== filme.id)
      );
      setFeedback({ type: "success", message: data.mensagem });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao remover o filme.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function salvarAvaliacao(event) {
    event.preventDefault();
    if (!reviewMovie) return;

    setBusyId(reviewMovie.id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/filmes/${reviewMovie.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nota: Number(reviewForm.nota),
          comentario: reviewForm.comentario.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Nao foi possivel salvar a avaliacao.");
      }

      setFilmes((filmesAtuais) =>
        filmesAtuais.map((filme) => (filme.id === data.id ? data : filme))
      );
      setActiveTab("Assistido");
      setReviewMovie(null);
      setReviewForm({ nota: "5", comentario: "" });
      setFeedback({ type: "success", message: "Avaliacao salva com sucesso." });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao salvar a avaliacao.",
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
        <Link href="/">MovieList</Link>
        <div className="dashboard-nav-actions">
          <Link href="/auth/login">Login</Link>
          <button type="button" onClick={sair}>
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
          <button type="button" className="primary-button" onClick={carregarFilmes}>
            Atualizar
          </button>
        </header>

        <div className="dashboard-tabs" role="tablist" aria-label="Listas de filmes">
          <button
            type="button"
            className={activeTab === "Wishlist" ? "active" : ""}
            onClick={() => setActiveTab("Wishlist")}
          >
            Wishlist <span>{wishlist.length}</span>
          </button>
          <button
            type="button"
            className={activeTab === "Assistido" ? "active" : ""}
            onClick={() => setActiveTab("Assistido")}
          >
            Filmes Assistidos <span>{assistidos.length}</span>
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
                ? "Sua wishlist ainda esta vazia."
                : "Voce ainda nao avaliou nenhum filme."}
            </p>
          )}
        </section>
      </section>

      {reviewMovie ? (
        <div className="modal-backdrop" role="presentation">
          <form className="review-modal" onSubmit={salvarAvaliacao}>
            <header>
              <p>{reviewMovie.titulo}</p>
              <h2>Dar nota e comentario</h2>
            </header>

            <label>
              Nota
              <select
                value={reviewForm.nota}
                onChange={(event) =>
                  setReviewForm((current) => ({
                    ...current,
                    nota: event.target.value,
                  }))
                }
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </label>

            <label>
              Comentario
              <textarea
                value={reviewForm.comentario}
                rows={4}
                placeholder="O que voce achou do filme?"
                onChange={(event) =>
                  setReviewForm((current) => ({
                    ...current,
                    comentario: event.target.value,
                  }))
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={fecharModalAvaliacao}
              >
                Cancelar
              </button>
              <button type="submit" className="primary-button" disabled={Boolean(busyId)}>
                {busyId ? "Salvando..." : "Salvar avaliacao"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
