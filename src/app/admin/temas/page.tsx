import { createClient } from '@/lib/supabase/server';
import FormTema from '@/components/admin/FormTema';
import BotaoExcluir from '@/components/admin/BotaoExcluir';
import MensagemErro from '@/components/MensagemErro';

export const dynamic = 'force-dynamic';

export default async function PaginaAdminTemas() {
  const supabase = createClient();
  const { data: temas, error } = await supabase.from('temas').select('*').order('nome');

  return (
    <div className="space-y-6">
      <FormTema />

      {error ? (
        <MensagemErro />
      ) : (
        <ul className="space-y-2">
          {(temas ?? []).map((tema) => (
            <li
              key={tema.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-noite/10 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-4 w-4 rounded-full border border-noite/10"
                  style={{ backgroundColor: tema.cor ?? '#ccc' }}
                />
                <span className="text-sm font-medium text-noite">{tema.nome}</span>
              </div>
              <BotaoExcluir
                tabela="temas"
                id={tema.id}
                confirmar={`Excluir o tema "${tema.nome}"? Os encontros ligados a ele ficarão sem tema.`}
              />
            </li>
          ))}
          {temas && temas.length === 0 && (
            <p className="rounded-xl bg-cartao p-6 text-center text-sm text-noite-suave shadow-suave">
              Nenhum tema cadastrado ainda.
            </p>
          )}
        </ul>
      )}
    </div>
  );
}
