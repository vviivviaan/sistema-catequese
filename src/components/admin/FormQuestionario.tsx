'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Encontro, Questionario } from '@/lib/supabase/types';

type Props = {
  encontros: Encontro[];
  questionario?: Questionario;
  aoSalvar?: () => void;
  aoCancelar?: () => void;
};

export default function FormQuestionario({ encontros, questionario, aoSalvar, aoCancelar }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [titulo, setTitulo] = useState(questionario?.titulo ?? '');
  const [encontroId, setEncontroId] = useState(questionario?.encontro_id ?? '');
  const [restrito, setRestrito] = useState(questionario?.restrito ?? false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const editando = !!questionario;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const dados = { titulo, encontro_id: encontroId, restrito };
    const { error } = editando
      ? await supabase.from('questionarios').update(dados).eq('id', questionario.id)
      : await supabase.from('questionarios').insert(dados);

    setSalvando(false);
    if (error) {
      setErro('Não foi possível salvar: ' + error.message);
      return;
    }

    if (!editando) {
      setTitulo('');
      setEncontroId('');
      setRestrito(false);
    }
    aoSalvar?.();
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-3 rounded-2xl bg-cartao p-4 shadow-suave">
      <div>
        <label className="mb-1 block text-xs font-medium text-noite-suave">Título</label>
        <input
          required
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-noite-suave">Encontro relacionado</label>
        <select
          required
          value={encontroId}
          onChange={(e) => setEncontroId(e.target.value)}
          className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
        >
          <option value="">Selecione um encontro</option>
          {encontros.map((enc) => (
            <option key={enc.id} value={enc.id}>
              {enc.titulo}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-noite">
        <input
          type="checkbox"
          checked={restrito}
          onChange={(e) => setRestrito(e.target.checked)}
          className="accent-mar"
        />
        Restrito — só catequizandos específicos podem responder (gerenciado depois de criar)
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-noite px-4 py-2 text-sm font-medium text-cal transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Adicionar questionário'}
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
