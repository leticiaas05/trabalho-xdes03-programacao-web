'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await res.json();

      if (!res.ok) {
        throw new Error(dados.erro || 'E-mail ou senha incorretos.');
      }

      router.push('/');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 relative overflow-hidden"
         style={{ backgroundImage: 'radial-gradient(circle at center, #1e1b4b 0%, #0a0a0a 100%)' }}>
      
      <div className="w-full max-w-md bg-neutral-900/80 backdrop-blur-md p-8 rounded-2xl border border-neutral-800 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-wider">
            Sétima<span className="text-red-600">Crítica</span>
          </h1>
          <p className="text-neutral-400 text-sm mt-2">Pronto para a próxima sessão?</p>
        </div>

        {erro && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 text-sm p-3 rounded-lg mb-6 text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">E-mail</label>
            <input
              type="email"
              required
              className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600 transition-colors"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">Senha</label>
            <input
              type="password"
              required
              className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600 transition-colors"
              placeholder=""
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors mt-6 disabled:opacity-50 cursor-pointer shadow-lg shadow-red-600/20"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-neutral-500 text-sm mt-6">
          Novo por aqui?{' '}
          <Link href="/auth/cadastro" className="text-red-500 hover:underline font-medium">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}