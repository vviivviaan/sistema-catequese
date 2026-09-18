'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function FormVersiculo() {
  const router = useRouter();
  const supabase = createClient();
  const [referencia, setReferencia] = useState('');
  const [texto, setTexto] = useState('');
  const [dataExibicao, setDataExibicao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const { error } = await supabase
      .from('versiculos')
      .insert({ referencia, texto, data_exibicao: dataExibicao });

    setSalvando(false);
    if (error) {
      setErro('Não foi possível salvar: ' + error.message);
      return;
    }

    setReferencia('');
    setTexto('');
    setDataExibicao('');
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-3 rounded-2xl bg-cartao p-4 shadow-suave">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-noite-suave">Referência</label>
          <input
            required
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="Ex: João 3:16"
            className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-noite-suave">
            Data de exibição
          </label>
          <input
            required
            type="date"
            value={dataExibicao}
            onChange={(e) => setDataExibicao(e.target.value)}
            className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-noite-suave">Texto</label>
        <textarea
          required
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
        />
      </div>
      <button
        type="submit"
        disabled={salvando}
        className="rounded-lg bg-noite px-4 py-2 text-sm font-medium text-cal transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {salvando ? 'Salvando…' : 'Adicionar versículo'}
      </button>
      {erro && <p className="text-sm text-vinho">{erro}</p>}
    </form>
  );
}
