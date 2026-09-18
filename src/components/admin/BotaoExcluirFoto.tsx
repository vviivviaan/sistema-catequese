'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function BotaoExcluirFoto({ id, urlImagem }: { id: string; urlImagem: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    if (!window.confirm('Excluir esta foto? Essa ação não pode ser desfeita.')) return;
    setExcluindo(true);

    // Remove o arquivo do bucket também, não só a linha no banco.
    const caminho = urlImagem.split('/galeria/')[1];
    if (caminho) {
      await supabase.storage.from('galeria').remove([caminho]);
    }

    const { error } = await supabase.from('fotos_galeria').delete().eq('id', id);
    setExcluindo(false);

    if (error) {
      window.alert('Não foi possível excluir: ' + error.message);
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={excluir}
      disabled={excluindo}
      className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-vinho shadow-suave transition-colors hover:bg-white disabled:opacity-50"
    >
      {excluindo ? 'Excluindo…' : 'Excluir'}
    </button>
  );
}
