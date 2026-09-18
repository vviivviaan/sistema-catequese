import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const LINKS_ADMIN = [
  { href: '/admin', label: 'Painel' },
  { href: '/admin/temas', label: 'Temas' },
  { href: '/admin/encontros', label: 'Encontros' },
  { href: '/admin/versiculos', label: 'Versículos' },
  { href: '/admin/fotos', label: 'Galeria' },
  { href: '/admin/questionarios', label: 'Questionários' },
];

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single();

  // O middleware já bloqueia /admin para quem não é administrador; esta
  // checagem é a segunda camada (defesa em profundidade), caso a página
  // seja alcançada por algum outro caminho.
  if (perfil?.role !== 'administrador') redirect('/');

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-rocha">
          Área administrativa
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-noite">
          Gestão do sistema
        </h1>
      </div>

      <nav className="flex flex-wrap gap-2 rounded-2xl bg-cartao p-3 shadow-suave">
        {LINKS_ADMIN.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-noite-suave transition-colors hover:bg-noite/5 hover:text-noite"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
