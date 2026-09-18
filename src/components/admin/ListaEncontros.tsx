'use client';

import { useState } from 'react';
import FormEncontro from './FormEncontro';
import BotaoExcluir from './BotaoExcluir';
import type { Encontro, Tema } from '@/lib/supabase/types';

type EncontroComTema = Encontro & { temas: { nome: string } | null };

export default function ListaEncontros({
  encontros,
  temas,
}: {
  encontros: EncontroComTema[];
  temas: Tema[];
}) {
  const [editandoId, setEditandoId] = useState<string | null>(null);

  if (encontros.length === 0) {
    return (
      <p className="rounded-xl bg-cartao p-6 text-center text-sm text-noite-suave shadow-suave">
        Nenhum encontro cadastrado ainda.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {encontros.map((encontro) =>
        editandoId === encontro.id ? (
          <li key={encontro.id}>
            <FormEncontro
              temas={temas}
              encontro={encontro}
              aoSalvar={() => setEditandoId(null)}
              aoCancelar={() => setEditandoId(null)}
            />
          </li>
        ) : (
          <li
            key={encontro.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-noite/10 bg-white p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-noite">{encontro.titulo}</p>
                <span className="rounded-full bg-mar/10 px-2 py-0.5 font-mono text-xs text-mar">
                  {encontro.temas?.nome ?? 'Sem tema'}
                </span>
              </div>
              <p className="font-mono text-xs text-noite-suave">
                {new Date(encontro.data_encontro + 'T00:00:00').toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditandoId(encontro.id)}
                className="rounded-full px-3 py-1 text-xs font-medium text-mar hover:bg-mar/10"
              >
                Editar
              </button>
              <BotaoExcluir
                tabela="encontros"
                id={encontro.id}
                confirmar={`Excluir o encontro "${encontro.titulo}"? O questionário ligado a ele também será excluído.`}
              />
            </div>
          </li>
        )
      )}
    </ul>
  );
}
