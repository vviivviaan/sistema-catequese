'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Pergunta } from '@/lib/supabase/types';

type Props = {
  questionarioId: string;
  proximaOrdem: number;
  pergunta?: Pergunta;
  aoSalvar?: () => void;
  aoCancelar?: () => void;
};

export default function FormPergunta({ questionarioId, proximaOrdem, pergunta, aoSalvar, aoCancelar }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [enunciado, setEnunciado] = useState(pergunta?.enunciado ?? '');
  const [opcoes, setOpcoes] = useState<string[]>(pergunta?.opcoes ?? ['', '']);
  const [respostaCorreta, setRespostaCorreta] = useState(pergunta?.resposta_correta ?? 0);
  const [ordem, setOrdem] = useState(pergunta?.ordem ?? proximaOrdem);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const editando = !!pergunta;

  function atualizarOpcao(indice: number, valor: string) {
    setOpcoes((atual) => atual.map((o, i) => (i === indice ? valor : o)));
  }

  function adicionarOpcao() {
    setOpcoes((atual) => [...atual, '']);
  }

  function removerOpcao(indice: number) {
    setOpcoes((atual) => atual.filter((_, i) => i !== indice));
    setRespostaCorreta((atual) => (atual >= indice && atual > 0 ? atual - 1 : atual));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    const opcoesLimpas = opcoes.map((o) => o.trim()).filter(Boolean);
    if (opcoesLimpas.length < 2) {
      setErro('Cadastre pelo menos 2 alternativas.');
      return;
    }
    if (respostaCorreta >= opcoesLimpas.length) {
      setErro('Selecione qual alternativa é a correta.');
      return;
    }

    setSalvando(true);

    const dados = { enunciado, ordem, opcoes: opcoesLimpas, resposta_correta: respostaCorreta };
    const { error } = editando
      ? await supabase.from('perguntas').update(dados).eq('id', pergunta.id)
      : await supabase.from('perguntas').insert({ ...dados, questionario_id: questionarioId });

    setSalvando(false);
    if (error) {
      setErro('Não foi possível salvar: ' + error.message);
      return;
    }

    if (!editando) {
      setEnunciado('');
      setOpcoes(['', '']);
      setRespostaCorreta(0);
      setOrdem(proximaOrdem + 1);
    }
    aoSalvar?.();
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-3 rounded-2xl bg-cartao p-4 shadow-suave">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="mb-1 block text-xs font-medium text-noite-suave">Enunciado</label>
          <textarea
            required
            rows={2}
            value={enunciado}
            onChange={(e) => setEnunciado(e.target.value)}
            className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-noite-suave">Ordem</label>
          <input
            type="number"
            min={1}
            value={ordem}
            onChange={(e) => setOrdem(Number(e.target.value))}
            className="w-20 rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-noite-suave">
          Alternativas (marque a correta)
        </label>
        {opcoes.map((opcao, indice) => (
          <div key={indice} className="flex items-center gap-2">
            <input
              type="radio"
              name="resposta_correta"
              checked={respostaCorreta === indice}
              onChange={() => setRespostaCorreta(indice)}
              className="accent-mar"
            />
            <input
              required
              value={opcao}
              onChange={(e) => atualizarOpcao(indice, e.target.value)}
              placeholder={`Alternativa ${indice + 1}`}
              className="flex-1 rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
            />
            {opcoes.length > 2 && (
              <button
                type="button"
                onClick={() => removerOpcao(indice)}
                className="rounded-full px-2 py-1 text-xs text-vinho hover:bg-vinho/10"
              >
                Remover
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={adicionarOpcao}
          className="text-xs font-medium text-mar hover:underline"
        >
          + adicionar alternativa
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-noite px-4 py-2 text-sm font-medium text-cal transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Adicionar pergunta'}
        </button>
        {editando && (
          <button
            type="button"
            onClick={aoCancelar}
            className="rounded-lg px-4 py-2 text-sm font-medium text-noite-suave hover:bg-noite/5"
          >
            Cancelar
          </button>
        )}
      </div>
      {erro && <p className="text-sm text-vinho">{erro}</p>}
    </form>
  );
}
