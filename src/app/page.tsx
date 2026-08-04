import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import TercoProgresso from '@/components/TercoProgresso';
import { pontosParaContas } from '@/lib/pontos';

export const dynamic = 'force-dynamic';

export default async function PaginaInicial() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hoje = new Date().toISOString().slice(0, 10);

  const [{ data: perfil }, { data: versiculo }, { data: proximoEncontro }] = await Promise.all([
    user
      ? supabase.from('perfis').select('*').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
    supabase.from('versiculos').select('*').eq('data_exibicao', hoje).maybeSingle(),
    supabase
      .from('encontros')
      .select('*, temas(nome)')
      .gte('data_encontro', hoje)
      .order('data_encontro', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const pontos = perfil?.pontos ?? 0;
  const contas = pontosParaContas(pontos);
  const primeiroNome = perfil?.nome?.split(' ')[0] ?? '';

  return (
    <div className="space-y-10">
      <section>
        <p className="font-mono text-xs uppercase tracking-widest text-rocha">
          Paróquia Nossa Senhora do Rosário · Vila Velha-ES
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-noite sm:text-4xl">
          {primeiroNome ? `Paz e Bem, ${primeiroNome}!` : `Paz e Bem, ${primeiroNome}!`}
        </h1>
      </section>

      {/* Versículo do dia */}
      <section className="rounded-2xl bg-noite p-6 text-cal shadow-elevado sm:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-vela">Versículo do dia</p>
        {versiculo ? (
          <>
            <p className="mt-3 font-display text-xl leading-relaxed sm:text-2xl">
              &ldquo;{versiculo.texto}&rdquo;
            </p>
            <p className="mt-3 text-sm text-cal/70">{versiculo.referencia}</p>
          </>
        ) : (
          <p className="mt-3 text-cal/70">
            Nenhum versículo cadastrado para hoje ainda.
          </p>
        )}
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Progresso / pontos */}
        <section className="rounded-2xl bg-cartao p-6 shadow-suave">
          <p className="font-mono text-xs uppercase tracking-widest text-noite-suave">
            Seu caminho
          </p>
          <TercoProgresso contasAcesas={contas} className="mx-auto mt-2 w-full max-w-xs" />
          <p className="text-center font-display text-2xl font-semibold text-noite">
            {pontos} pontos
          </p>
          <p className="text-center text-sm text-noite-suave">
            {contas} {contas === 1 ? 'conta acesa' : 'contas acesas'} no seu terço de engajamento
          </p>
          <Link
            href="/ranking"
            className="mt-4 block text-center text-sm font-medium text-mar hover:underline"
          >
            Ver ranking da comunidade →
          </Link>
        </section>

        {/* Próximo encontro */}
        <section className="rounded-2xl bg-cartao p-6 shadow-suave">
          <p className="font-mono text-xs uppercase tracking-widest text-noite-suave">
            Próximo encontro
          </p>
          {proximoEncontro ? (
            <>
              <h2 className="mt-2 font-display text-xl font-semibold text-noite">
                {proximoEncontro.titulo}
              </h2>
              <p className="mt-1 text-sm text-noite-suave">
                {new Date(proximoEncontro.data_encontro + 'T00:00:00').toLocaleDateString(
                  'pt-BR',
                  { weekday: 'long', day: '2-digit', month: 'long' }
                )}
              </p>
              <p className="mt-3 text-sm text-noite/80">{proximoEncontro.resumo}</p>
              <Link
                href={`/encontros/${proximoEncontro.id}`}
                className="mt-4 inline-block text-sm font-medium text-mar hover:underline"
              >
                Ver conteúdo do encontro →
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm text-noite-suave">
              Nenhum encontro futuro cadastrado no momento.
            </p>
          )}
        </section>
      </div>

      {/* Atalhos */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/encontros"
          className="rounded-xl border border-noite/10 bg-white p-5 transition-colors hover:border-rocha/40"
        >
          <p className="font-display text-lg font-semibold text-noite">Encontros</p>
          <p className="mt-1 text-sm text-noite-suave">Conteúdo por tema e data</p>
        </Link>
        <Link
          href="/galeria"
          className="rounded-xl border border-noite/10 bg-white p-5 transition-colors hover:border-rocha/40"
        >
          <p className="font-display text-lg font-semibold text-noite">Galeria</p>
          <p className="mt-1 text-sm text-noite-suave">Fotos das datas festivas</p>
        </Link>
        <Link
          href="/questionarios"
          className="rounded-xl border border-noite/10 bg-white p-5 transition-colors hover:border-rocha/40"
        >
          <p className="font-display text-lg font-semibold text-noite">Questionários</p>
          <p className="mt-1 text-sm text-noite-suave">Responda e ganhe pontos</p>
        </Link>
      </section>
    </div>
  );
}
