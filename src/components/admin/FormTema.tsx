'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function FormTema() {
  const router = useRouter();
  const supabase = createClient();
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#2F6E8C');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const { error } = await supabase.from('temas').insert({ nome, cor });

    setSalvando(false);
    if (error) {
      setErro('Não foi possível salvar: ' + error.message);
      return;
    }

    setNome('');
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="flex flex-wrap items-end gap-3 rounded-2xl bg-cartao p-4 shadow-suave">
      <div className="flex-1 min-w-[200px]">
        <label className="mb-1 block text-xs font-medium text-noite-suave">Nome do tema</label>
        <input
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Sacramentos"
          className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-noite-suave">Cor</label>
        <input
          type="color"
          value={cor}
          onChange={(e) => setCor(e.target.value)}
          className="h-9 w-14 rounded-lg border border-noite/15 bg-white"
        />
      </div>
      <button
        type="submit"
        disabled={salvando}
        className="rounded-lg bg-noite px-4 py-2 text-sm font-medium text-cal transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {salvando ? 'Salvando…' : 'Adicionar tema'}
      </button>
      {erro && <p className="w-full text-sm text-vinho">{erro}</p>}
    </form>
  );
}
