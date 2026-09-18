-- ============================================================================
-- Cateque com Adultos — schema completo do banco (Supabase / Postgres)
-- Rode este arquivo inteiro no SQL Editor do Supabase (New query → Run).
-- Idempotente: pode ser executado mais de uma vez sem duplicar dados.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABELAS
-- ----------------------------------------------------------------------------

create table if not exists perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null,
  pontos integer not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists temas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cor text
);

create table if not exists encontros (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  resumo text not null,
  conteudo text not null,
  tema_id uuid references temas (id) on delete set null,
  data_encontro date not null,
  criado_em timestamptz not null default now()
);

create table if not exists versiculos (
  id uuid primary key default gen_random_uuid(),
  referencia text not null,
  texto text not null,
  data_exibicao date not null
);

create table if not exists fotos_galeria (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  data_evento date not null,
  url_imagem text not null,
  criado_em timestamptz not null default now()
);

create table if not exists questionarios (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  encontro_id uuid references encontros (id) on delete cascade,
  pontos_totais integer not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists perguntas (
  id uuid primary key default gen_random_uuid(),
  questionario_id uuid not null references questionarios (id) on delete cascade,
  enunciado text not null,
  ordem integer not null default 0,
  opcoes jsonb not null,
  resposta_correta integer not null
);

create table if not exists respostas_usuario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references perfis (id) on delete cascade,
  questionario_id uuid not null references questionarios (id) on delete cascade,
  acertos integer not null,
  total_perguntas integer not null,
  pontos_ganhos integer not null,
  respondido_em timestamptz not null default now(),
  -- impede responder o mesmo questionário mais de uma vez
  constraint respostas_usuario_unico unique (usuario_id, questionario_id)
);

create index if not exists idx_encontros_data on encontros (data_encontro);
create index if not exists idx_encontros_tema on encontros (tema_id);
create index if not exists idx_versiculos_data on versiculos (data_exibicao);
create index if not exists idx_perguntas_questionario on perguntas (questionario_id, ordem);
create index if not exists idx_respostas_usuario on respostas_usuario (usuario_id);
create index if not exists idx_perfis_pontos on perfis (pontos desc);

-- ----------------------------------------------------------------------------
-- 2. CRIAÇÃO AUTOMÁTICA DE PERFIL NO CADASTRO
--    Em vez do app inserir a linha em `perfis` pelo client (o que deixa a
--    conta "quebrada" se essa chamada falhar), um trigger no banco garante
--    que todo usuário de auth.users sempre tenha um perfil correspondente.
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfis (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. CORREÇÃO DO QUESTIONÁRIO NO SERVIDOR (RPC)
--    O gabarito (`resposta_correta`) nunca deve ser exposto ao navegador nem
--    a pontuação calculada pelo cliente (ver seção 5 sobre GRANTs). Toda
--    submissão de respostas passa por esta função, que roda com privilégios
--    de dono da tabela (SECURITY DEFINER) e por isso pode ler o gabarito e
--    gravar os pontos com segurança.
--
--    Regras de pontuação (mantidas em sincronia com src/lib/pontos.ts):
--      - 10 pontos por resposta correta
--      - +20 pontos de bônus ao acertar 100% do questionário
-- ----------------------------------------------------------------------------

create or replace function public.responder_questionario(
  p_questionario_id uuid,
  p_respostas jsonb -- formato: [{"pergunta_id": "uuid", "resposta": 0}, ...]
)
returns table (acertos integer, total_perguntas integer, pontos_ganhos integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usuario_id uuid := auth.uid();
  v_total integer;
  v_acertos integer;
  v_pontos integer;
begin
  if v_usuario_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  if exists (
    select 1 from respostas_usuario
    where usuario_id = v_usuario_id and questionario_id = p_questionario_id
  ) then
    raise exception 'Você já respondeu este questionário';
  end if;

  select count(*) into v_total
  from perguntas
  where questionario_id = p_questionario_id;

  if v_total = 0 then
    raise exception 'Este questionário não tem perguntas cadastradas';
  end if;

  select count(*) into v_acertos
  from perguntas p
  join jsonb_to_recordset(p_respostas) as r(pergunta_id uuid, resposta integer)
    on r.pergunta_id = p.id
  where p.questionario_id = p_questionario_id
    and r.resposta = p.resposta_correta;

  v_pontos := v_acertos * 10;
  if v_acertos = v_total then
    v_pontos := v_pontos + 20;
  end if;

  insert into respostas_usuario (usuario_id, questionario_id, acertos, total_perguntas, pontos_ganhos)
  values (v_usuario_id, p_questionario_id, v_acertos, v_total, v_pontos);

  update perfis set pontos = pontos + v_pontos where id = v_usuario_id;

  return query select v_acertos, v_total, v_pontos;
end;
$$;

grant execute on function public.responder_questionario(uuid, jsonb) to authenticated;

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------

alter table perfis enable row level security;
alter table temas enable row level security;
alter table encontros enable row level security;
alter table versiculos enable row level security;
alter table fotos_galeria enable row level security;
alter table questionarios enable row level security;
alter table perguntas enable row level security;
alter table respostas_usuario enable row level security;

-- perfis: qualquer autenticado pode ver todos (necessário para o ranking).
-- Não há política de INSERT/UPDATE/DELETE para `authenticated`: a criação é
-- feita pelo trigger acima e os pontos só mudam via responder_questionario
-- (ambos rodam como dono da tabela e por isso ignoram RLS).
drop policy if exists "perfis_select" on perfis;
create policy "perfis_select" on perfis for select to authenticated using (true);

-- conteúdo (temas, encontros, versículos, fotos, questionários): leitura
-- liberada para autenticados; cadastro de conteúdo continua sendo feito
-- pelo Table Editor do Supabase (com a service role, que ignora RLS).
drop policy if exists "temas_select" on temas;
create policy "temas_select" on temas for select to authenticated using (true);

drop policy if exists "encontros_select" on encontros;
create policy "encontros_select" on encontros for select to authenticated using (true);

drop policy if exists "versiculos_select" on versiculos;
create policy "versiculos_select" on versiculos for select to authenticated using (true);

drop policy if exists "fotos_galeria_select" on fotos_galeria;
create policy "fotos_galeria_select" on fotos_galeria for select to authenticated using (true);

drop policy if exists "questionarios_select" on questionarios;
create policy "questionarios_select" on questionarios for select to authenticated using (true);

-- perguntas: leitura liberada a nível de linha, mas a coluna `resposta_correta`
-- é bloqueada a nível de coluna logo abaixo (seção 5) para não vazar o gabarito.
drop policy if exists "perguntas_select" on perguntas;
create policy "perguntas_select" on perguntas for select to authenticated using (true);

-- respostas_usuario: cada usuário só vê o próprio histórico. Não existe
-- política de INSERT/UPDATE para `authenticated` — toda escrita passa pela
-- função responder_questionario.
drop policy if exists "respostas_usuario_select" on respostas_usuario;
create policy "respostas_usuario_select" on respostas_usuario
  for select to authenticated using (usuario_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5. GRANTS DE COLUNA
--    Reforça em nível de privilégio (não só de política) que o cliente nunca
--    escreve pontos diretamente e nunca lê o gabarito das perguntas.
-- ----------------------------------------------------------------------------

revoke all on perfis from authenticated, anon;
grant select on perfis to authenticated;

revoke all on perguntas from authenticated, anon;
grant select (id, questionario_id, enunciado, ordem, opcoes) on perguntas to authenticated;

revoke all on respostas_usuario from authenticated, anon;
grant select on respostas_usuario to authenticated;

revoke all on temas from anon;
grant select on temas to authenticated;

revoke all on encontros from anon;
grant select on encontros to authenticated;

revoke all on versiculos from anon;
grant select on versiculos to authenticated;

revoke all on fotos_galeria from anon;
grant select on fotos_galeria to authenticated;

revoke all on questionarios from anon;
grant select on questionarios to authenticated;

-- ----------------------------------------------------------------------------
-- 6. DADOS DE EXEMPLO (opcional — ajuda a ver o app funcionando de imediato)
-- ----------------------------------------------------------------------------

insert into temas (nome, cor)
select 'Sacramentos', '#7c5cff'
where not exists (select 1 from temas where nome = 'Sacramentos');

insert into versiculos (referencia, texto, data_exibicao)
select 'João 3:16',
       'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
       current_date
where not exists (select 1 from versiculos where data_exibicao = current_date);

with tema_exemplo as (
  select id from temas where nome = 'Sacramentos' limit 1
)
insert into encontros (titulo, resumo, conteudo, tema_id, data_encontro)
select
  'O Sacramento do Batismo',
  'Uma introdução ao primeiro sacramento de iniciação cristã.',
  'O Batismo é a porta de entrada para a vida cristã e para os demais sacramentos. Nele, somos libertados do pecado e nascemos como filhos de Deus, tornando-nos membros da Igreja.',
  tema_exemplo.id,
  current_date + interval '7 days'
from tema_exemplo
where not exists (select 1 from encontros where titulo = 'O Sacramento do Batismo');

with encontro_exemplo as (
  select id from encontros where titulo = 'O Sacramento do Batismo' limit 1
)
insert into questionarios (titulo, encontro_id)
select 'Questionário: O Sacramento do Batismo', encontro_exemplo.id
from encontro_exemplo
where not exists (select 1 from questionarios where titulo = 'Questionário: O Sacramento do Batismo');

with questionario_exemplo as (
  select id from questionarios where titulo = 'Questionário: O Sacramento do Batismo' limit 1
)
insert into perguntas (questionario_id, enunciado, ordem, opcoes, resposta_correta)
select questionario_exemplo.id,
       'O Batismo é a porta de entrada para qual dimensão da vida cristã?',
       1,
       '["A vida litúrgica", "A vida cristã e os demais sacramentos", "A vida monástica", "Nenhuma das anteriores"]'::jsonb,
       1
from questionario_exemplo
where not exists (
  select 1 from perguntas
  where enunciado = 'O Batismo é a porta de entrada para qual dimensão da vida cristã?'
);
