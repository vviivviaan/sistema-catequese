'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function FormFoto() {
  const router = useRouter();
  const supabase = createClient();
  const [titulo, setTitulo] = useState('');
  const [dataEvento, setDataEvento] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!arquivo) {
      setErro('Escolha uma foto para enviar.');
      return;
    }

    setEnviando(true);

    const extensao = arquivo.name.split('.').pop();
    const caminho = `${crypto.randomUUID()}.${extensao}`;

    const { error: erroUpload } = await supabase.storage.from('galeria').upload(caminho, arquivo);

    if (erroUpload) {
      setEnviando(false);
      setErro('Não foi possível enviar a foto: ' + erroUpload.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('galeria').getPublicUrl(caminho);

    const { error: erroInsercao } = await supabase.from('fotos_galeria').insert({
      titulo,
      data_evento: dataEvento,
      url_imagem: publicUrl,
    });

    setEnviando(false);

    if (erroInsercao) {
      setErro('A foto foi enviada, mas não foi possível salvá-la: ' + erroInsercao.message);
      return;
    }

    setTitulo('');
    setDataEvento('');
    setArquivo(null);
    (e.target as HTMLFormElement).reset();
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
            placeholder="Ex: Encontro de Natal"
            className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-noite-suave">Data do evento</label>
          <input
            required
            type="date"
            value={dataEvento}
            onChange={(e) => setDataEvento(e.target.value)}
            className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-noite-suave">Foto</label>
        <input
          required
          type="file"
          accept="image/*"
          onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          className="w-full rounded-lg border border-noite/15 bg-white px-3 py-1.5 text-sm text-noite outline-none focus:border-mar"
        />
      </div>
      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-noite px-4 py-2 text-sm font-medium text-cal transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {enviando ? 'Enviando…' : 'Adicionar foto'}
      </button>
      {erro && <p className="text-sm text-vinho">{erro}</p>}
    </form>
  );
}
