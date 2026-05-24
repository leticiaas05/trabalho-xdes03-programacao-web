"use client";

// Componente React do formulario de cadastro.
// Ele intercepta o envio padrao do HTML e envia os dados para a API usando fetch.

import { useState } from "react";

// Valores iniciais dos campos do formulario.
const initialFormState = {
  nome: "",
  email: "",
  senha: "",
  confirmacaoSenha: "",
};

export function CadastroForm() {
  // Guarda o que o usuario digita.
  const [form, setForm] = useState(initialFormState);

  // Guarda mensagem de sucesso ou erro para mostrar na tela.
  const [feedback, setFeedback] = useState(null);

  // Controla o texto do botao enquanto a requisicao esta acontecendo.
  const [isLoading, setIsLoading] = useState(false);

  // Controla se a mensagem de senhas diferentes deve aparecer.
  const [showPasswordError, setShowPasswordError] = useState(false);

  // Atualiza um campo especifico do formulario.
  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setFeedback(null);
    setShowPasswordError(false);
  }

  // Mostra o erro de senha tambem no clique do botao.
  // Isso ajuda quando o navegador bloqueia o envio antes do onSubmit.
  function validatePasswordsOnClick() {
    if (form.senha && form.confirmacaoSenha && form.senha !== form.confirmacaoSenha) {
      setShowPasswordError(true);
      setFeedback({ type: "error", message: "As senhas precisam ser iguais." });
    }
  }

  // Executa quando o usuario clica em Criar conta.
  async function handleSubmit(event) {
    event.preventDefault();

    if (form.senha !== form.confirmacaoSenha) {
      setShowPasswordError(true);
      setFeedback({ type: "error", message: "As senhas precisam ser iguais." });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Nao foi possivel realizar o cadastro.");
      }

      setFeedback({ type: "success", message: data.mensagem || "Cadastro realizado com sucesso!" });
      setForm(initialFormState);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Erro inesperado ao cadastrar usuario.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="cadastro-form">
      <div className="cadastro-field">
        <label htmlFor="nome">Usuario</label>
        <input
          id="nome"
          name="nome"
          type="text"
          value={form.nome}
          placeholder="Digite seu usuario"
          autoComplete="username"
          required
          onChange={updateField}
        />
      </div>

      <div className="cadastro-field">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          placeholder="voce@email.com"
          autoComplete="email"
          required
          onChange={updateField}
        />
      </div>

      <div className="cadastro-field">
        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          name="senha"
          type="password"
          value={form.senha}
          placeholder="Minimo de 4 caracteres"
          autoComplete="new-password"
          minLength={4}
          required
          onChange={updateField}
        />
      </div>

      <div className="cadastro-field">
        <label htmlFor="confirmacaoSenha">Confirmacao de senha</label>
        <input
          id="confirmacaoSenha"
          name="confirmacaoSenha"
          type="password"
          value={form.confirmacaoSenha}
          placeholder="Repita sua senha"
          autoComplete="new-password"
          minLength={4}
          required
          onChange={updateField}
        />

        {showPasswordError ? <p className="cadastro-field-error">As senhas digitadas nao conferem.</p> : null}
      </div>

      {feedback ? (
        <p className={`cadastro-feedback cadastro-feedback-${feedback.type}`} role="status">
          {feedback.message}
        </p>
      ) : null}

      <button type="submit" disabled={isLoading} onClick={validatePasswordsOnClick}>
        {isLoading ? "Cadastrando..." : "Criar conta"}
      </button>
    </form>
  );
}
