import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MensagemErro from '@/components/MensagemErro';

export const dynamic = 'force-dynamic';

export default async function PaginaDetalheEncontro({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: encontro, error: erroEncontro } = await supabase
    .from('encontros')
    .select('*, temas(nome)')
    .eq('id', params.id)
    .single();

  // PGRST116 = nenhuma linha encontrada (id não existe de fato) → 404.
  // Qualquer outro erro é uma falha real de conexão/permissão.
  if (erroEncontro && erroEncontro.code !== 'PGRST116') {
    return <MensagemErro />;
  }
  if (!encontro) notFound();

  const { data: questionario } = await supabase
    .from('questionarios')
    .select('id, titulo')
    .eq('encontro_id', params.id)
    .maybeSingle();

  return (
    <article className="space-y-6">
      <Link href="/encontros" className="text-sm font-medium text-mar hover:underline">
        ← Voltar para encontros
      </Link>

      <header>
        <span className="rounded-full bg-mar/10 px-2.5 py-0.5 font-mono text-xs text-mar">
          {(encontro as any).temas?.nome ?? 'Sem tema'}
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold text-noite">
          {encontro.titulo}
        </h1>
        <p className="mt-1 font-mono text-xs text-noite-suave">
          {new Date(encontro.data_encontro + 'T00:00:00').toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </header>

      <div className="whitespace-pre-line rounded-2xl bg-cartao p-6 leading-relaxed text-noite shadow-suave">
        {encontro.conteudo}
      </div>

      {questionario && (
        <Link
          href={`/questionarios/${questionario.id}`}
          className="block rounded-2xl bg-noite p-5 text-center font-medium text-cal shadow-elevado transition-opacity hover:opacity-90"
        >
          Responder questionário deste encontro: {questionario.titulo} →
        </Link>
      )}
    </article>
  );
}
