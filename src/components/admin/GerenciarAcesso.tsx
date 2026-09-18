'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Perfil } from '@/lib/supabase/types';

export default function GerenciarAcesso({
  questionarioId,
  autorizados,
  disponiveis,
}: {
  questionarioId: string;
  autorizados: Perfil[];
  disponiveis: Perfil[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [selecionado, setSelecionado] = useState('');
  const [processando, setProcessando] = useState(false);

  async function adicionar() {
    if (!selecionado) return;
    setProcessando(true);
    const { error } = await supabase
      .from('questionario_acesso')
      .insert({ questionario_id: questionarioId, usuario_id: selecionado });
    setProcessando(false);

    if (error) {
      window.alert('Não foi possível liberar acesso: ' + error.message);
      return;
    }
    setSelecionado('');
    router.refresh();
  }

  async function remover(usuarioId: string) {
    setProcessando(true);
    const { error } = await supabase
      .from('questionario_acesso')
      .delete()
      .eq('questionario_id', questionarioId)
      .eq('usuario_id', usuarioId);
    setProcessando(false);

    if (error) {
      window.alert('Não foi possível remover o acesso: ' + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-2xl bg-cartao p-4 shadow-suave">
      <p className="text-xs font-medium uppercase tracking-widest text-noite-suave">
        Catequizandos com acesso
      </p>

      {autorizados.length === 0 ? (
        <p className="text-sm text-noite-suave">
          Ninguém tem acesso ainda — este questionário está invisível para todos até você liberar
          pelo menos uma pessoa.
        </p>
      ) : (
        <ul className="space-y-1">
          {autorizados.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-sm"
            >
              <span className="text-noite">{p.nome}</span>
              <button
                type="button"
                disabled={processando}
                onClick={() => remover(p.id)}
                className="rounded-full px-2 py-0.5 text-xs font-medium text-vinho hover:bg-vinho/10 disabled:opacity-50"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      {disponiveis.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={selecionado}
            onChange={(e) => setSelecionado(e.target.value)}
            className="flex-1 rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
          >
            <option value="">Selecione um catequizando</option>
            {disponiveis.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selecionado || processando}
            onClick={adicionar}
            className="rounded-lg bg-noite px-4 py-1.5 text-sm font-medium text-cal transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Liberar acesso
          </button>
        </div>
      )}
    </div>
  );
}
