'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState(''); // <-- Adicionado para bater com seu Zod
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, confirmacaoSenha }),
      });

      const dados = await res.json();

      if (!res.ok) {
        throw new Error(dados.erro || 'Erro ao realizar cadastro.');
      }

      router.push('/auth/login'); 
    } catch (err) {
      console.log(err); 
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
};

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4 relative overflow-hidden" 
         style={{ backgroundImage: 'radial-gradient(circle at center, #1e1b4b 0%, #0a0a0a 100%)' }}>
      
      <div className="w-full max-w-md bg-neutral-900/80 backdrop-blur-md p-8 rounded-2xl border border-neutral-800 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-wider">
            Sétima<span className="text-red-600">Crítica</span>
          </h1>
          <p className="text-neutral-400 text-sm mt-2">Crie sua conta e comece o catálogo</p>
        </div>

        {erro && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 text-sm p-3 rounded-lg mb-6 text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleCadastro} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Nome Completo</label>
            <input
              type="text"
              required
              className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-600 transition-colors"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">E-mail</label>
            <input
              type="email"
              required
              className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-600 transition-colors"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Senha</label>
            <input
              type="password"
              required
              className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-600 transition-colors"
              placeholder="Mínimo 4 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">Confirmar Senha</label>
            <input
              type="password"
              required
              className="w-full bg-neutral-800 text-white border border-neutral-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-600 transition-colors"
              placeholder="Repita a senha"
              value={confirmacaoSenha}
              onChange={(e) => setConfirmacaoSenha(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors mt-4 disabled:opacity-50 cursor-pointer shadow-lg shadow-red-600/20"
          >
            {carregando ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center text-neutral-500 text-sm mt-6">
          Já tem uma conta?{' '}
          <Link href="/auth/login" className="text-red-500 hover:underline font-medium">
            Entrar aqui
          </Link>
        </p>
      </div>
    </div>
  );
}