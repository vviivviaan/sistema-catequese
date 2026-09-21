'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PaginaRedefinirSenha() {
  const router = useRouter();
  const supabase = createClient();
  const [statusLink, setStatusLink] = useState<'verificando' | 'valido' | 'invalido'>(
    'verificando'
  );
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    // O link do e-mail autentica a pessoa temporariamente (sessão de
    // recuperação) assim que a página carrega. Se depois de um tempo não
    // houver sessão, o link é inválido ou já expirou.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === 'PASSWORD_RECOVERY' || evento === 'SIGNED_IN') {
        setStatusLink('valido');
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatusLink('valido');
    });

    const tempoLimite = setTimeout(() => {
      setStatusLink((atual) => (atual === 'verificando' ? 'invalido' : atual));
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(tempoLimite);
    };
  }, [supabase]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);

    if (error) {
      setErro('Não foi possível salvar a nova senha. Tente pedir um novo link.');
      return;
    }

    setSucesso(true);
    await supabase.auth.signOut();
    setTimeout(() => router.push('/login'), 2000);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
      <div className="mb-8 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-rocha">
          Paróquia Nossa Senhora do Rosário · Vila Velha-ES
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-noite">Nova senha</h1>
      </div>

      {statusLink === 'verificando' && (
        <p className="text-center text-sm text-noite-suave">Verificando o link…</p>
      )}

      {statusLink === 'invalido' && (
        <div className="rounded-2xl bg-cartao p-6 text-center shadow-suave">
          <p className="font-medium text-noite">Link inválido ou expirado</p>
          <p className="mt-1 text-sm text-noite-suave">
            Peça um novo link de redefinição e tente novamente.
          </p>
          <Link
            href="/recuperar-senha"
            className="mt-4 inline-block text-sm font-medium text-mar hover:underline"
          >
            Pedir novo link
          </Link>
        </div>
      )}

      {statusLink === 'valido' &&
        (sucesso ? (
          <div className="rounded-2xl bg-cartao p-6 text-center shadow-suave">
            <p className="font-medium text-noite">Senha atualizada! 🙏</p>
            <p className="mt-1 text-sm text-noite-suave">Redirecionando para o login…</p>
          </div>
        ) : (
          <form onSubmit={salvar} className="space-y-4 rounded-2xl bg-cartao p-6 shadow-suave">
            <div>
              <label htmlFor="senha" className="mb-1 block text-sm font-medium text-noite">
                Nova senha
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
            <div>
              <label
                htmlFor="confirmarSenha"
                className="mb-1 block text-sm font-medium text-noite"
              >
                Confirmar nova senha
              </label>
              <input
                id="confirmarSenha"
                type="password"
                required
                minLength={6}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full rounded-lg border border-noite/15 bg-white px-3 py-2 text-noite outline-none focus:border-mar"
                placeholder="Repita a senha"
              />
            </div>

            {erro && (
              <p role="alert" className="rounded-lg bg-vinho/10 px-3 py-2 text-sm text-vinho">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={salvando}
              className="w-full rounded-lg bg-noite py-2.5 font-medium text-cal transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {salvando ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
        ))}
    </div>
  );
}
