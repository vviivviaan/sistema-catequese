'use client';

import { useState } from 'react';
import FormPergunta from './FormPergunta';
import BotaoExcluir from './BotaoExcluir';
import type { Pergunta } from '@/lib/supabase/types';

export default function ListaPerguntas({
  questionarioId,
  perguntas,
}: {
  questionarioId: string;
  perguntas: Pergunta[];
}) {
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const proximaOrdem = perguntas.length > 0 ? Math.max(...perguntas.map((p) => p.ordem)) + 1 : 1;

  return (
    <div className="space-y-4">
      {perguntas.length === 0 ? (
        <p className="rounded-xl bg-white p-4 text-center text-sm text-noite-suave shadow-suave">
          Nenhuma pergunta cadastrada ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {perguntas.map((pergunta) =>
            editandoId === pergunta.id ? (
              <li key={pergunta.id}>
                <FormPergunta
                  questionarioId={questionarioId}
                  proximaOrdem={proximaOrdem}
                  pergunta={pergunta}
                  aoSalvar={() => setEditandoId(null)}
                  aoCancelar={() => setEditandoId(null)}
                />
              </li>
            ) : (
              <li key={pergunta.id} className="rounded-xl border border-noite/10 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-noite">
                    {pergunta.ordem}. {pergunta.enunciado}
                  </p>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditandoId(pergunta.id)}
                      className="rounded-full px-3 py-1 text-xs font-medium text-mar hover:bg-mar/10"
                    >
                      Editar
                    </button>
                    <BotaoExcluir
                      tabela="perguntas"
                      id={pergunta.id}
                      confirmar="Excluir esta pergunta?"
                    />
                  </div>
                </div>
                <ul className="mt-2 space-y-1">
                  {pergunta.opcoes.map((opcao, indice) => (
                    <li
                      key={indice}
                      className={`rounded-lg px-3 py-1.5 text-sm ${
                        indice === pergunta.resposta_correta
                          ? 'bg-vela/15 font-medium text-noite'
                          : 'text-noite-suave'
                      }`}
                    >
                      {opcao} {indice === pergunta.resposta_correta && '✓'}
                    </li>
                  ))}
                </ul>
              </li>
            )
          )}
        </ul>
      )}

      <FormPergunta questionarioId={questionarioId} proximaOrdem={proximaOrdem} />
    </div>
  );
}
