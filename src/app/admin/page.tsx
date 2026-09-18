import Link from 'next/link';

const CARTOES = [
  { href: '/admin/temas', titulo: 'Temas', descricao: 'Categorias usadas para organizar os encontros.' },
  { href: '/admin/encontros', titulo: 'Encontros', descricao: 'Conteúdo semanal: título, resumo, texto e data.' },
  { href: '/admin/versiculos', titulo: 'Versículos', descricao: 'Versículo do dia, por data de exibição.' },
  { href: '/admin/fotos', titulo: 'Galeria', descricao: 'Upload e cadastro de fotos de datas festivas.' },
  {
    href: '/admin/questionarios',
    titulo: 'Questionários',
    descricao: 'Perguntas, gabarito e controle de acesso por catequizando.',
  },
];

export default function PaginaAdminInicio() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CARTOES.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          className="rounded-xl border border-noite/10 bg-white p-5 transition-colors hover:border-rocha/40"
        >
          <p className="font-display text-lg font-semibold text-noite">{c.titulo}</p>
          <p className="mt-1 text-sm text-noite-suave">{c.descricao}</p>
        </Link>
      ))}
    </div>
  );
}
