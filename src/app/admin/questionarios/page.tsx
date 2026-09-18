import { createClient } from '@/lib/supabase/server';
import FormQuestionario from '@/components/admin/FormQuestionario';
import ListaQuestionarios from '@/components/admin/ListaQuestionarios';
import MensagemErro from '@/components/MensagemErro';

export const dynamic = 'force-dynamic';

export default async function PaginaAdminQuestionarios() {
  const supabase = createClient();

  const { data: encontros } = await supabase
    .from('encontros')
    .select('*')
    .order('data_encontro', { ascending: false });

  const { data: questionarios, error } = await supabase
    .from('questionarios')
    .select('*, encontros(titulo)')
    .order('criado_em', { ascending: false });

  return (
    <div className="space-y-6">
      <FormQuestionario encontros={encontros ?? []} />

      {error ? (
        <MensagemErro />
      ) : (
        <ListaQuestionarios questionarios={questionarios ?? []} encontros={encontros ?? []} />
      )}
    </div>
  );
}
