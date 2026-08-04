import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import FiltroEncontros from '@/components/FiltroEncontros';

export const dynamic = 'force-dynamic';

export default async function PaginaEncontros({
  searchParams,
}: {
  searchParams: { tema?: string; inicio?: string; fim?: string };
}) {
  const supabase = createClient();

  const { data: temas } = await supabase.from('temas').select('*').order('nome');

  let consulta = supabase
    .from('encontros')
    .select('*, temas(nome, cor)')
    .order('data_encontro', { ascending: false });

  if (searchParams.tema) consulta = consulta.eq('tema_id', searchParams.tema);
  if (searchParams.inicio) consulta = consulta.gte('data_encontro', searchParams.inicio);
  if (searchParams.fim) consulta = consulta.lte('data_encontro', searchParams.fim);

  const { data: encontros } = await consulta;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-rocha">Conteúdo semanal</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-noite">Encontros</h1>
      </div>

      <FiltroEncontros temas={temas ?? []} />

      {encontros && encontros.length > 0 ? (
        <ul className="space-y-3">
          {encontros.map((encontro: any) => (
            <li key={encontro.id}>
              <Link
                href={`/encontros/${encontro.id}`}
                className="block rounded-xl border border-noite/10 bg-white p-5 transition-colors hover:border-rocha/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold text-noite">
                    {encontro.titulo}
                  </h2>
                  <span className="rounded-full bg-mar/10 px-2.5 py-0.5 font-mono text-xs text-mar">
                    {encontro.temas?.nome ?? 'Sem tema'}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-noite-suave">
                  {new Date(encontro.data_encontro + 'T00:00:00').toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="mt-2 text-sm text-noite/80">{encontro.resumo}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl bg-cartao p-6 text-center text-sm text-noite-suave shadow-suave">
          Nenhum encontro encontrado para os filtros selecionados.
        </p>
      )}
    </div>
  );
}
