'use client';

import { useState } from 'react';
import Link from 'next/link';
import FormQuestionario from './FormQuestionario';
import BotaoExcluir from './BotaoExcluir';
import type { Encontro, Questionario } from '@/lib/supabase/types';

type QuestionarioComEncontro = Questionario & { encontros: { titulo: string } | null };

export default function ListaQuestionarios({
  questionarios,
  encontros,
}: {
  questionarios: QuestionarioComEncontro[];
  encontros: Encontro[];
}) {
  const [editandoId, setEditandoId] = useState<string | null>(null);

  if (questionarios.length === 0) {
    return (
      <p className="rounded-xl bg-cartao p-6 text-center text-sm text-noite-suave shadow-suave">
        Nenhum questionário cadastrado ainda.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {questionarios.map((q) =>
        editandoId === q.id ? (
          <li key={q.id}>
            <FormQuestionario
              encontros={encontros}
              questionario={q}
              aoSalvar={() => setEditandoId(null)}
              aoCancelar={() => setEditandoId(null)}
            />
          </li>
        ) : (
          <li
            key={q.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-noite/10 bg-white p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-noite">{q.titulo}</p>
                {q.restrito && (
                  <span className="rounded-full bg-vela/15 px-2 py-0.5 font-mono text-xs text-vela">
                    Restrito
                  </span>
                )}
              </div>
              <p className="text-xs text-noite-suave">Encontro: {q.encontros?.titulo ?? '—'}</p>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/admin/questionarios/${q.id}`}
                className="rounded-full px-3 py-1 text-xs font-medium text-mar hover:bg-mar/10"
              >
                Perguntas e acesso
              </Link>
              <button
                type="button"
                onClick={() => setEditandoId(q.id)}
                className="rounded-full px-3 py-1 text-xs font-medium text-mar hover:bg-mar/10"
              >
                Editar
              </button>
              <BotaoExcluir
                tabela="questionarios"
                id={q.id}
                confirmar={`Excluir o questionário "${q.titulo}"? As perguntas e respostas ligadas a ele também serão excluídas.`}
              />
            </div>
          </li>
        )
      )}
    </ul>
  );
}
