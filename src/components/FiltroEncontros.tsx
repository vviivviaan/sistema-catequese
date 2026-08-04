'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Tema } from '@/lib/supabase/types';

export default function FiltroEncontros({ temas }: { temas: Tema[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const temaAtual = searchParams.get('tema') ?? '';
  const dataInicio = searchParams.get('inicio') ?? '';
  const dataFim = searchParams.get('fim') ?? '';

  function atualizarFiltro(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) params.set(chave, valor);
    else params.delete(chave);
    router.push(`/encontros?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-cartao p-4 shadow-suave">
      <div>
        <label className="mb-1 block text-xs font-medium text-noite-suave">Tema</label>
        <select
          value={temaAtual}
          onChange={(e) => atualizarFiltro('tema', e.target.value)}
          className="rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
        >
          <option value="">Todos os temas</option>
          {temas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-noite-suave">De</label>
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => atualizarFiltro('inicio', e.target.value)}
          className="rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-noite-suave">Até</label>
        <input
          type="date"
          value={dataFim}
          onChange={(e) => atualizarFiltro('fim', e.target.value)}
          className="rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
        />
      </div>
      {(temaAtual || dataInicio || dataFim) && (
        <button
          onClick={() => router.push('/encontros')}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-vinho hover:bg-vinho/10"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
