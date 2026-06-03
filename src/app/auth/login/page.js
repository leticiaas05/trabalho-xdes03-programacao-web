import Link from "next/link";
import { LoginForm } from "./login";
import "./login.css";

// O Next.js precisa deste arquivo para criar a rota /auth/login.
export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-card">
        <nav className="login-nav">
          <Link href="/">Home</Link>
          <Link href="/auth/cadastro">Cadastro</Link>
        </nav>

        <header className="login-header">
          <h1>Login</h1>
          <p>Informe seu usuario e senha para entrar.</p>
        </header>

        <LoginForm />
      </section>
    </main>
  );
}
