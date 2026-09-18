import { createClient } from '@/lib/supabase/server';
import FormVersiculo from '@/components/admin/FormVersiculo';
import BotaoExcluir from '@/components/admin/BotaoExcluir';
import MensagemErro from '@/components/MensagemErro';

export const dynamic = 'force-dynamic';

export default async function PaginaAdminVersiculos() {
  const supabase = createClient();
  const { data: versiculos, error } = await supabase
    .from('versiculos')
    .select('*')
    .order('data_exibicao', { ascending: false });

  return (
    <div className="space-y-6">
      <FormVersiculo />

      {error ? (
        <MensagemErro />
      ) : (
        <ul className="space-y-2">
          {(versiculos ?? []).map((v) => (
            <li
              key={v.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-noite/10 bg-white p-4"
            >
              <div>
                <p className="font-mono text-xs text-noite-suave">
                  {new Date(v.data_exibicao + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
                <p className="mt-1 text-sm text-noite">&ldquo;{v.texto}&rdquo;</p>
                <p className="mt-1 text-xs text-noite-suave">{v.referencia}</p>
              </div>
              <BotaoExcluir
                tabela="versiculos"
                id={v.id}
                confirmar="Excluir este versículo?"
              />
            </li>
          ))}
          {versiculos && versiculos.length === 0 && (
            <p className="rounded-xl bg-cartao p-6 text-center text-sm text-noite-suave shadow-suave">
              Nenhum versículo cadastrado ainda.
            </p>
          )}
        </ul>
      )}
    </div>
  );
}
