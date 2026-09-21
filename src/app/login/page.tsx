'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PaginaLogin() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) {
      setErro('E-mail ou senha incorretos. Tente novamente.');
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
      <div className="mb-8 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-rocha">
          Paróquia Nossa Senhora do Rosário · Vila Velha-ES
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-noite">
          Cateque com Adultos
        </h1>
        <p className="mt-2 text-sm text-noite-suave">
          Entre para acompanhar os encontros e o seu caminho.
        </p>
      </div>

      <form onSubmit={entrar} className="space-y-4 rounded-2xl bg-cartao p-6 shadow-suave">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-noite">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-noite/15 bg-white px-3 py-2 text-noite outline-none focus:border-mar"
            placeholder="seu@email.com"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="senha" className="block text-sm font-medium text-noite">
              Senha
            </label>
            <Link href="/recuperar-senha" className="text-xs font-medium text-mar hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <input
            id="senha"
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-lg border border-noite/15 bg-white px-3 py-2 text-noite outline-none focus:border-mar"
            placeholder="••••••••"
          />
        </div>

        {erro && (
          <p role="alert" className="rounded-lg bg-vinho/10 px-3 py-2 text-sm text-vinho">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-lg bg-noite py-2.5 font-medium text-cal transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {carregando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-noite-suave">
        Ainda não tem conta?{' '}
        <Link href="/cadastro" className="font-medium text-mar hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
