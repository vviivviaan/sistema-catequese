import { createClient } from '@/lib/supabase/server';
import FormEncontro from '@/components/admin/FormEncontro';
import ListaEncontros from '@/components/admin/ListaEncontros';
import MensagemErro from '@/components/MensagemErro';

export const dynamic = 'force-dynamic';

export default async function PaginaAdminEncontros() {
  const supabase = createClient();

  const { data: temas } = await supabase.from('temas').select('*').order('nome');
  const { data: encontros, error } = await supabase
    .from('encontros')
    .select('*, temas(nome)')
    .order('data_encontro', { ascending: false });

  return (
    <div className="space-y-6">
      <FormEncontro temas={temas ?? []} />

      {error ? <MensagemErro /> : <ListaEncontros encontros={encontros ?? []} temas={temas ?? []} />}
    </div>
  );
}
