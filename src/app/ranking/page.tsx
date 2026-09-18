import { createClient } from '@/lib/supabase/server';
import MensagemErro from '@/components/MensagemErro';

export const dynamic = 'force-dynamic';

const MEDALHAS = ['🥇', '🥈', '🥉'];

export default async function PaginaRanking() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfis, error: erroPerfis } = await supabase
    .from('perfis')
    .select('id, nome, pontos')
    .order('pontos', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-rocha">Comunidade</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-noite">
          Ranking de engajamento
        </h1>
        <p className="mt-1 text-sm text-noite-suave">
          Pontos acumulados respondendo aos questionários dos encontros.
        </p>
      </div>

      {erroPerfis && <MensagemErro />}

      <ol className="space-y-2">
        {(perfis ?? []).map((perfil, indice) => {
          const souEu = perfil.id === user?.id;
          return (
            <li
              key={perfil.id}
              className={`flex items-center justify-between gap-4 rounded-xl border p-4 ${
                souEu
                  ? 'border-mar bg-mar/5'
                  : 'border-noite/10 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 text-center font-mono text-sm text-noite-suave">
                  {MEDALHAS[indice] ?? `${indice + 1}º`}
                </span>
                <span className="font-medium text-noite">
                  {perfil.nome} {souEu && <span className="text-mar">(você)</span>}
                </span>
              </div>
              <span className="font-mono text-sm font-medium text-vela">{perfil.pontos} pts</span>
            </li>
          );
        })}
      </ol>

      {!erroPerfis && (!perfis || perfis.length === 0) && (
        <p className="rounded-xl bg-cartao p-6 text-center text-sm text-noite-suave shadow-suave">
          Ninguém pontuou ainda. Seja o primeiro a responder um questionário!
        </p>
      )}
    </div>
  );
}
