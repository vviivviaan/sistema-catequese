import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TercoProgresso from '@/components/TercoProgresso';
import { pontosParaContas } from '@/lib/pontos';

export const dynamic = 'force-dynamic';

export default async function PaginaPerfil() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: perfil } = await supabase.from('perfis').select('*').eq('id', user.id).single();

  const { data: respostas } = await supabase
    .from('respostas_usuario')
    .select('*, questionarios(titulo)')
    .eq('usuario_id', user.id)
    .order('respondido_em', { ascending: false });

  const pontos = perfil?.pontos ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-rocha">Seu perfil</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-noite">{perfil?.nome}</h1>
        <p className="text-sm text-noite-suave">{perfil?.email}</p>
      </div>

      <section className="rounded-2xl bg-cartao p-6 text-center shadow-suave">
        <TercoProgresso
          contasAcesas={pontosParaContas(pontos)}
          className="mx-auto w-full max-w-xs"
        />
        <p className="font-display text-2xl font-semibold text-noite">{pontos} pontos</p>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-noite">
          Questionários respondidos
        </h2>
        {respostas && respostas.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {respostas.map((r: any) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-noite/10 bg-white px-4 py-3"
              >
                <span className="text-sm text-noite">{r.questionarios?.titulo}</span>
                <span className="font-mono text-xs text-vela">
                  {r.acertos}/{r.total_perguntas} · +{r.pontos_ganhos} pts
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-noite-suave">
            Você ainda não respondeu nenhum questionário.
          </p>
        )}
      </section>
    </div>
  );
}
