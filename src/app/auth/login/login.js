"use client";

// Componente React do formulario de login.
// Ele intercepta o envio padrao do HTML, chama a API com fetch e mostra mensagens na tela.

import { useState } from "react";

// Valores iniciais dos campos do formulario.
const initialFormState = {
  email: "",
  senha: "",
};

export function LoginForm() {
  // Guarda o que o usuario digita.
  const [form, setForm] = useState(initialFormState);

  // Guarda mensagem de sucesso ou erro retornada pela API.
  const [feedback, setFeedback] = useState(null);

  // Controla o texto do botao enquanto a requisicao esta acontecendo.
  const [isLoading, setIsLoading] = useState(false);

  // Atualiza um campo especifico do formulario.
  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setFeedback(null);
  }

  // Executa quando o usuario clica em Entrar.
  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Nao foi possivel realizar o login.");
      }

      // Salva o Token JWT nos Cookies por 1 dia para iniciar a protecao das rotas.
      document.cookie = `token=${encodeURIComponent(data.token)}; path=/; max-age=86400; SameSite=Lax`;

      setFeedback({ type: "success", message: data.mensagem || "Login realizado com sucesso." });
      setForm(initialFormState);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erro inesperado ao tentar fazer login.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="login-field">
        <label htmlFor="email">Usuario</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          placeholder="Digite seu e-mail"
          autoComplete="email"
          required
          onChange={updateField}
        />
      </div>

      <div className="login-field">
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          name="senha"
          type="password"
          value={form.senha}
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
          onChange={updateField}
        />
      </div>

      {feedback ? (
        <p className={`login-feedback login-feedback-${feedback.type}`} role="status">
          {feedback.message}
        </p>
      ) : null}

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
