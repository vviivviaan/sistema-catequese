import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import QuestionarioForm from '@/components/QuestionarioForm';

export const dynamic = 'force-dynamic';

export default async function PaginaDetalheQuestionario({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: questionario } = await supabase
    .from('questionarios')
    .select('*, encontros(titulo)')
    .eq('id', params.id)
    .single();

  if (!questionario) notFound();

  // Não seleciona `resposta_correta`: o gabarito nunca deve chegar ao navegador.
  const { data: perguntas } = await supabase
    .from('perguntas')
    .select('id, questionario_id, enunciado, ordem, opcoes')
    .eq('questionario_id', params.id)
    .order('ordem', { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: jaRespondeu } = user
    ? await supabase
        .from('respostas_usuario')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('questionario_id', params.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-6">
      <Link href="/questionarios" className="text-sm font-medium text-mar hover:underline">
        ← Voltar para questionários
      </Link>

      <header>
        <h1 className="font-display text-3xl font-semibold text-noite">{questionario.titulo}</h1>
        <p className="mt-1 text-sm text-noite-suave">
          Referente ao encontro: {(questionario as any).encontros?.titulo ?? '—'}
        </p>
      </header>

      {jaRespondeu ? (
        <div className="rounded-2xl bg-cartao p-6 text-center shadow-suave">
          <p className="font-medium text-noite">Você já respondeu este questionário</p>
          <p className="mt-1 text-sm text-noite-suave">
            Acertos: {jaRespondeu.acertos}/{jaRespondeu.total_perguntas} · Pontos ganhos: +
            {jaRespondeu.pontos_ganhos}
          </p>
        </div>
      ) : perguntas && perguntas.length > 0 ? (
        <QuestionarioForm questionarioId={params.id} perguntas={perguntas} />
      ) : (
        <p className="rounded-xl bg-cartao p-6 text-center text-sm text-noite-suave shadow-suave">
          Este questionário ainda não tem perguntas cadastradas.
        </p>
      )}
    </div>
  );
}
