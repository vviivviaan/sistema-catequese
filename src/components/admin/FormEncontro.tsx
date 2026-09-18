'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Encontro, Tema } from '@/lib/supabase/types';

type Props = {
  temas: Tema[];
  encontro?: Encontro;
  aoSalvar?: () => void;
  aoCancelar?: () => void;
};

export default function FormEncontro({ temas, encontro, aoSalvar, aoCancelar }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [titulo, setTitulo] = useState(encontro?.titulo ?? '');
  const [resumo, setResumo] = useState(encontro?.resumo ?? '');
  const [conteudo, setConteudo] = useState(encontro?.conteudo ?? '');
  const [temaId, setTemaId] = useState(encontro?.tema_id ?? '');
  const [dataEncontro, setDataEncontro] = useState(encontro?.data_encontro ?? '');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const editando = !!encontro;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const dados = { titulo, resumo, conteudo, tema_id: temaId || null, data_encontro: dataEncontro };
    const { error } = editando
      ? await supabase.from('encontros').update(dados).eq('id', encontro.id)
      : await supabase.from('encontros').insert(dados);

    setSalvando(false);
    if (error) {
      setErro('Não foi possível salvar: ' + error.message);
      return;
    }

    if (!editando) {
      setTitulo('');
      setResumo('');
      setConteudo('');
      setTemaId('');
      setDataEncontro('');
    }
    aoSalvar?.();
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-3 rounded-2xl bg-cartao p-4 shadow-suave">
      <div className="grid gap-3 sm:grid-cols-2">
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
          <label className="mb-1 block text-xs font-medium text-noite-suave">Data do encontro</label>
          <input
            required
            type="date"
            value={dataEncontro}
            onChange={(e) => setDataEncontro(e.target.value)}
            className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-noite-suave">Tema</label>
        <select
          value={temaId}
          onChange={(e) => setTemaId(e.target.value)}
          className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
        >
          <option value="">Sem tema</option>
          {temas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-noite-suave">Resumo</label>
        <input
          required
          value={resumo}
          onChange={(e) => setResumo(e.target.value)}
          placeholder="Uma frase curta que aparece na listagem"
          className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-noite-suave">Conteúdo completo</label>
        <textarea
          required
          rows={6}
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-noite px-4 py-2 text-sm font-medium text-cal transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Adicionar encontro'}
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
