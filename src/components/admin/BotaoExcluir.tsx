'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Props = {
  // Todas as tabelas suportadas aqui têm `id` como chave primária.
  // `questionario_acesso` (chave composta) é excluída diretamente em
  // GerenciarAcesso.tsx, não por este componente.
  tabela: 'temas' | 'encontros' | 'versiculos' | 'fotos_galeria' | 'questionarios' | 'perguntas';
  id: string;
  confirmar?: string;
  onExcluido?: () => void;
};

export default function BotaoExcluir({ tabela, id, confirmar, onExcluido }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    if (confirmar && !window.confirm(confirmar)) return;
    setExcluindo(true);

    const { error } = await supabase.from(tabela).delete().eq('id', id);
    setExcluindo(false);

    if (error) {
      window.alert('Não foi possível excluir: ' + error.message);
      return;
    }

    onExcluido?.();
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={excluir}
      disabled={excluindo}
      className="rounded-full px-3 py-1 text-xs font-medium text-vinho transition-colors hover:bg-vinho/10 disabled:opacity-50"
    >
      {excluindo ? 'Excluindo…' : 'Excluir'}
    </button>
  );
}
