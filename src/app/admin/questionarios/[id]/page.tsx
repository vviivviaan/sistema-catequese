import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ListaPerguntas from '@/components/admin/ListaPerguntas';
import ToggleRestrito from '@/components/admin/ToggleRestrito';
import GerenciarAcesso from '@/components/admin/GerenciarAcesso';
import MensagemErro from '@/components/MensagemErro';
import type { Perfil } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function PaginaAdminQuestionario({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: questionario, error: erroQuestionario } = await supabase
    .from('questionarios')
    .select('*, encontros(titulo)')
    .eq('id', params.id)
    .single();

  if (erroQuestionario && erroQuestionario.code !== 'PGRST116') return <MensagemErro />;
  if (!questionario) notFound();

  // admin_listar_perguntas é a única forma de ler o gabarito (resposta_correta)
  // — a coluna continua bloqueada por GRANT para leitura direta via REST.
  const { data: perguntas, error: erroPerguntas } = await supabase.rpc('admin_listar_perguntas', {
    p_questionario_id: params.id,
  });

  let autorizados: Perfil[] = [];
  let todosPerfis: Perfil[] = [];

  if (questionario.restrito) {
    const [{ data: acesso }, { data: perfis }] = await Promise.all([
      supabase
        .from('questionario_acesso')
        .select('usuario_id, perfis(id, nome, email, pontos, role, criado_em)')
        .eq('questionario_id', params.id),
      supabase.from('perfis').select('*').order('nome'),
    ]);

    autorizados = (acesso ?? [])
      .map((a: any) => a.perfis as Perfil)
      .filter(Boolean);
    todosPerfis = perfis ?? [];
  }

  const idsAutorizados = new Set(autorizados.map((p) => p.id));
  const disponiveis = todosPerfis.filter((p) => !idsAutorizados.has(p.id));

  return (
    <div className="space-y-6">
      <Link href="/admin/questionarios" className="text-sm font-medium text-mar hover:underline">
        ← Voltar para questionários
      </Link>

      <header>
        <h2 className="font-display text-2xl font-semibold text-noite">{questionario.titulo}</h2>
        <p className="mt-1 text-sm text-noite-suave">
          Referente ao encontro: {(questionario as any).encontros?.titulo ?? '—'}
        </p>
      </header>

      <ToggleRestrito questionarioId={questionario.id} restrito={questionario.restrito} />

      {questionario.restrito && (
        <GerenciarAcesso
          questionarioId={questionario.id}
          autorizados={autorizados}
          disponiveis={disponiveis}
        />
      )}

      <div>
        <h3 className="mb-3 font-display text-lg font-semibold text-noite">Perguntas</h3>
        {erroPerguntas ? (
          <MensagemErro mensagem={erroPerguntas.message} />
        ) : (
          <ListaPerguntas questionarioId={questionario.id} perguntas={perguntas ?? []} />
        )}
      </div>
    </div>
  );
}
