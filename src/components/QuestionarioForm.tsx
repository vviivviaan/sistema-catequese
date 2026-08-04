'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { calcularPontos } from '@/lib/pontos';
import type { Pergunta } from '@/lib/supabase/types';

type Props = {
  questionarioId: string;
  perguntas: Pergunta[];
};

type Resultado = {
  acertos: number;
  total: number;
  pontosGanhos: number;
};

export default function QuestionarioForm({ questionarioId, perguntas }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const todasRespondidas = perguntas.every((p) => respostas[p.id] !== undefined);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErro('Sua sessão expirou. Faça login novamente.');
      setEnviando(false);
      return;
    }

    const acertos = perguntas.filter((p) => respostas[p.id] === p.resposta_correta).length;
    const pontosGanhos = calcularPontos(acertos, perguntas.length);

    const { error: erroResposta } = await supabase.from('respostas_usuario').insert({
      usuario_id: user.id,
      questionario_id: questionarioId,
      acertos,
      total_perguntas: perguntas.length,
      pontos_ganhos: pontosGanhos,
    });

    if (erroResposta) {
      setErro('Não foi possível enviar suas respostas. Tente novamente.');
      setEnviando(false);
      return;
    }

    // Atualiza o total de pontos do perfil (soma incremental)
    const { data: perfilAtual } = await supabase
      .from('perfis')
      .select('pontos')
      .eq('id', user.id)
      .single();

    await supabase
      .from('perfis')
      .update({ pontos: (perfilAtual?.pontos ?? 0) + pontosGanhos })
      .eq('id', user.id);

    setResultado({ acertos, total: perguntas.length, pontosGanhos });
    setEnviando(false);
    router.refresh();
  }

  if (resultado) {
    return (
      <div className="rounded-2xl bg-noite p-6 text-center text-cal shadow-elevado">
        <p className="font-mono text-xs uppercase tracking-widest text-vela">Resultado</p>
        <p className="mt-2 font-display text-3xl font-semibold">
          {resultado.acertos} de {resultado.total} acertos
        </p>
        <p className="mt-1 text-cal/80">Você ganhou +{resultado.pontosGanhos} pontos</p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-5">
      {perguntas.map((pergunta, indice) => (
        <fieldset
          key={pergunta.id}
          className="rounded-xl border border-noite/10 bg-white p-5"
        >
          <legend className="font-medium text-noite">
            {indice + 1}. {pergunta.enunciado}
          </legend>
          <div className="mt-3 space-y-2">
            {pergunta.opcoes.map((opcao, i) => (
              <label
                key={i}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  respostas[pergunta.id] === i
                    ? 'border-mar bg-mar/5 text-noite'
                    : 'border-noite/10 text-noite-suave hover:border-noite/25'
                }`}
              >
                <input
                  type="radio"
                  name={pergunta.id}
                  value={i}
                  checked={respostas[pergunta.id] === i}
                  onChange={() => setRespostas((r) => ({ ...r, [pergunta.id]: i }))}
                  className="accent-mar"
                />
                {opcao}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {erro && (
        <p role="alert" className="rounded-lg bg-vinho/10 px-3 py-2 text-sm text-vinho">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={!todasRespondidas || enviando}
        className="w-full rounded-lg bg-noite py-2.5 font-medium text-cal transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {enviando ? 'Enviando…' : 'Enviar respostas'}
      </button>
    </form>
  );
}
