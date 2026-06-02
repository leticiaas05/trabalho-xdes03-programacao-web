import Link from "next/link";
import { CadastroForm } from "./cadastro";
import "./cadastro.css";

// O Next.js precisa deste arquivo para criar a rota /auth/cadastro.
export default function CadastroPage() {
  return (
    <main className="cadastro-page">
      <section className="cadastro-card">
        <nav className="cadastro-nav">
          <Link href="/">Home</Link>
          <Link href="/auth/login">Login</Link>
        </nav>

        <header className="cadastro-header">
          <h1>Cadastrar usuario</h1>
          <p>Preencha os campos abaixo para criar sua conta.</p>
        </header>

        <CadastroForm />
      </section>
    </main>
  );
}
