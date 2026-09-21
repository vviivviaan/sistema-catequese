'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const LINKS = [
  { href: '/', label: 'Início' },
  { href: '/encontros', label: 'Encontros' },
  { href: '/galeria', label: 'Galeria' },
  { href: '/questionarios', label: 'Questionários' },
  { href: '/ranking', label: 'Ranking' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [logado, setLogado] = useState(false);
  const [ehAdmin, setEhAdmin] = useState(false);

  useEffect(() => {
    async function carregarSessao(userId: string | undefined) {
      setLogado(!!userId);
      if (!userId) {
        setEhAdmin(false);
        return;
      }
      const { data: perfil } = await supabase.from('perfis').select('*').eq('id', userId).single();
      setEhAdmin(perfil?.role === 'administrador');
    }

    supabase.auth.getUser().then(({ data }) => carregarSessao(data.user?.id));
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      carregarSessao(sessao?.user?.id);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  if (['/login', '/cadastro', '/recuperar-senha', '/redefinir-senha'].includes(pathname)) {
    return null;
  }

  async function sair() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="border-b border-noite/10 bg-cartao/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-noite">
            Catequese <span className="text-rocha">com Adultos</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {LINKS.map((link) => {
            const ativo = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 font-medium transition-colors ${ativo
                    ? 'bg-noite text-cal'
                    : 'text-noite-suave hover:bg-noite/5 hover:text-noite'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
          {ehAdmin && (
            <Link
              href="/admin"
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${pathname.startsWith('/admin')
                  ? 'bg-noite text-cal'
                  : 'text-rocha hover:bg-rocha/10'
                }`}
            >
              Painel Admin
            </Link>
          )}
          {logado && (
            <button
              onClick={sair}
              className="ml-1 rounded-full px-3 py-1.5 font-medium text-vinho transition-colors hover:bg-vinho/10"
            >
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
