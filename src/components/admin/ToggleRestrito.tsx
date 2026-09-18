'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ToggleRestrito({
  questionarioId,
  restrito,
}: {
  questionarioId: string;
  restrito: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [salvando, setSalvando] = useState(false);

  async function alternar(valor: boolean) {
    setSalvando(true);
    const { error } = await supabase
      .from('questionarios')
      .update({ restrito: valor })
      .eq('id', questionarioId);
    setSalvando(false);

    if (error) {
      window.alert('Não foi possível atualizar: ' + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2 text-sm text-noite">
      <input
        type="checkbox"
        checked={restrito}
        disabled={salvando}
        onChange={(e) => alternar(e.target.checked)}
        className="accent-mar"
      />
      Restrito a catequizandos específicos
    </label>
  );
}
