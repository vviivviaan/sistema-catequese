'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PaginaCadastro() {
  const router = useRouter();
  const supabase = createClient();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });

    // O perfil em `perfis` é criado automaticamente por um trigger no banco
    // (on_auth_user_created), então não precisa ser inserido pelo cliente aqui.

    if (error) {
      setCarregando(false);
      setErro('Não foi possível concluir o cadastro. Verifique os dados e tente novamente.');
      return;
    }

    setCarregando(false);
    setSucesso(true);
    setTimeout(() => router.push('/login'), 1800);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
      <div className="mb-8 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-rocha">
          Paróquia Nossa Senhora do Rosário · Vila Velha-ES
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-noite">Criar conta</h1>
        <p className="mt-2 text-sm text-noite-suave">
          Comece a acompanhar os encontros semanais da catequese.
        </p>
      </div>

      {sucesso ? (
        <div className="rounded-2xl bg-cartao p-6 text-center shadow-suave">
          <p className="font-medium text-noite">Cadastro realizado! 🙏</p>
          <p className="mt-1 text-sm text-noite-suave">Redirecionando para o login…</p>
        </div>
      ) : (
        <form onSubmit={cadastrar} className="space-y-4 rounded-2xl bg-cartao p-6 shadow-suave">
          <div>
            <label htmlFor="nome" className="mb-1 block text-sm font-medium text-noite">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-noite/15 bg-white px-3 py-2 text-noite outline-none focus:border-mar"
              placeholder="Seu nome"
            />
          </div>
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
            <label htmlFor="senha" className="mb-1 block text-sm font-medium text-noite">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-noite/15 bg-white px-3 py-2 text-noite outline-none focus:border-mar"
              placeholder="Mínimo 6 caracteres"
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
            {carregando ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-noite-suave">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-mar hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
