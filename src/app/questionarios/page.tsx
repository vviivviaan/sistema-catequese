import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import MensagemErro from '@/components/MensagemErro';

export const dynamic = 'force-dynamic';

export default async function PaginaQuestionarios() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: questionarios, error: erroQuestionarios } = await supabase
    .from('questionarios')
    .select('*, encontros(titulo)')
    .order('criado_em', { ascending: false });

  const { data: respondidos } = user
    ? await supabase.from('respostas_usuario').select('questionario_id, acertos, total_perguntas, pontos_ganhos').eq('usuario_id', user.id)
    : { data: [] };

  const mapaRespondidos = new Map(
    (respondidos ?? []).map((r) => [r.questionario_id, r])
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-rocha">
          Estude e participe
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-noite">Questionários</h1>
        <p className="mt-1 text-sm text-noite-suave">
          Responda aos questionários dos temas estudados e acumule pontos no ranking.
        </p>
      </div>

      {erroQuestionarios ? (
        <MensagemErro />
      ) : questionarios && questionarios.length > 0 ? (
        <ul className="space-y-3">
          {questionarios.map((q: any) => {
            const resultado = mapaRespondidos.get(q.id);
            return (
              <li key={q.id}>
                <Link
                  href={`/questionarios/${q.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-noite/10 bg-white p-5 transition-colors hover:border-rocha/40"
                >
                  <div>
                    <h2 className="font-display text-lg font-semibold text-noite">{q.titulo}</h2>
                    <p className="mt-1 text-sm text-noite-suave">
                      Referente ao encontro: {q.encontros?.titulo ?? '—'}
                    </p>
                  </div>
                  {resultado ? (
                    <span className="whitespace-nowrap rounded-full bg-vela/15 px-3 py-1 font-mono text-xs text-vela">
                      ✓ {resultado.acertos}/{resultado.total_perguntas} · +{resultado.pontos_ganhos} pts
                    </span>
                  ) : (
                    <span className="whitespace-nowrap rounded-full bg-mar/10 px-3 py-1 font-mono text-xs text-mar">
                      Responder
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl bg-cartao p-6 text-center text-sm text-noite-suave shadow-suave">
          Nenhum questionário disponível no momento.
        </p>
      )}
    </div>
  );
}
