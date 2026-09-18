# Cateque com Adultos

Sistema de catequese de adultos da **Paróquia Nossa Senhora do Rosário** — Vila Velha-ES.

Permite que os catequizandos: acompanhem o conteúdo dos encontros semanais (filtrando por tema e data), leiam o versículo bíblico do dia, vejam a galeria de fotos de datas festivas, respondam questionários sobre os temas estudados e acumulem pontos em um ranking de engajamento.

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase (autenticação, banco de dados e RLS). Hospedagem: Vercel.

---

## 1. Pré-requisitos

- [Node.js](https://nodejs.org) 18 ou superior instalado
- Uma conta gratuita em [supabase.com](https://supabase.com)
- Uma conta gratuita em [vercel.com](https://vercel.com)
- Git instalado (para publicar no GitHub, opcional mas recomendado)

---

## 2. Criar o banco de dados no Supabase

1. Crie um projeto novo em [supabase.com](https://supabase.com) (escolha uma senha forte para o banco e a região **South America (São Paulo)**).
2. No painel do projeto, vá em **SQL Editor** → **New query**.
3. Abra o arquivo [`supabase/schema.sql`](./supabase/schema.sql) deste projeto, copie todo o conteúdo, cole no editor e clique em **Run**.
   - Isso cria todas as tabelas (`perfis`, `temas`, `encontros`, `versiculos`, `fotos_galeria`, `questionarios`, `perguntas`, `respostas_usuario`), já com as políticas de segurança (Row Level Security) e alguns dados de exemplo.
4. Vá em **Authentication → Providers** e confirme que **Email** está habilitado (vem habilitado por padrão).
   - Recomendado: em **Authentication → Settings**, desabilite a confirmação por e-mail obrigatória durante os testes iniciais (você pode reativar depois).
5. Vá em **Storage** → **New bucket** e crie um bucket chamado `galeria`, marcado como **Public bucket**. É nele que você vai subir as fotos das datas festivas (depois, salve a URL pública da imagem na tabela `fotos_galeria`).
6. Vá em **Project Settings → API** e copie:
   - **Project URL**
   - **anon public key**

---

## 3. Rodar o projeto localmente

```bash
# 1. Entre na pasta do projeto
cd cateque-com-adultos

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.local.example .env.local
# abra o .env.local e cole a Project URL e a anon key copiadas no passo anterior

# 4. Rode o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`, clique em **Cadastre-se**, crie uma conta e explore o sistema.

---

## 4. Painel administrativo e cadastro de conteúdo

O cadastro de conteúdo (temas, encontros, versículos, fotos e questionários) é feito **dentro do próprio site**, em `/admin`, por quem tiver `perfis.role = 'administrador'`. Catequizandos comuns nunca veem esse link nem conseguem acessar `/admin` (bloqueado tanto no middleware quanto nas políticas de RLS do banco).

**Promovendo o primeiro administrador:**

1. Crie sua conta normalmente pelo cadastro do site.
2. No SQL Editor do Supabase, rode uma vez (trocando o e-mail):
   ```sql
   update perfis set role = 'administrador' where email = 'seu@email.com';
   ```
3. Atualize a página — o link **"Painel Admin"** aparece no menu.

**O que dá para gerenciar pelo painel:**

- **Temas**: nome e cor.
- **Encontros**: título, resumo, conteúdo completo, tema e data — com edição.
- **Versículos**: referência, texto e data de exibição.
- **Galeria**: upload direto de fotos (vai para o bucket `galeria` do Storage automaticamente) e exclusão.
- **Questionários**: título, encontro relacionado, perguntas com gabarito (múltiplas alternativas, edição e exclusão) e controle de acesso — por padrão todo questionário fica visível a todos os catequizandos, mas pode ser marcado como **"Restrito"** para liberar apenas a uma lista específica de pessoas (ex: recuperação de quem faltou).

A correção do gabarito continua acontecendo inteiramente no banco (seção 6) — mesmo um administrador não consegue ler `resposta_correta` por uma consulta comum; a edição de perguntas passa por uma função (`admin_listar_perguntas`) que só funciona para quem tem `role = 'administrador'`.

---

## 5. Publicar no Vercel

1. Suba este projeto para um repositório no GitHub (ou GitLab/Bitbucket).
2. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o repositório.
3. Em **Environment Variables**, adicione as duas mesmas variáveis do `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**. Em cerca de 1 minuto o site estará no ar em um endereço `.vercel.app`.
5. Opcional: em **Project Settings → Domains**, adicione um domínio próprio (ex: `catequeseadultos.org.br`, se a paróquia adquirir um).
6. **Antes de divulgar o site**: volte em **Authentication → Settings** no Supabase e reative a confirmação por e-mail obrigatória, caso tenha desabilitado durante os testes (passo 2.4) — sem isso, qualquer pessoa pode se cadastrar com o e-mail de outra pessoa.

---

## 6. Sistema de pontos

A correção do questionário e o cálculo de pontos acontecem **no banco**, na função `responder_questionario` (definida em [`supabase/schema.sql`](./supabase/schema.sql)) — não no navegador. Isso é proposital: o gabarito (`resposta_correta`) nunca é enviado ao cliente, e a pontuação nunca é um valor que o navegador possa forjar.

- **10 pontos** por pergunta correta no questionário.
- **+20 pontos de bônus** ao acertar 100% de um questionário.
- Os pontos acumulados também "acendem" contas no terço de progresso exibido no perfil e na tela inicial (a cada 30 pontos, uma conta se acende) — o elemento visual de identidade do sistema. Essa conversão (só visual, sem impacto na pontuação) está em [`src/lib/pontos.ts`](./src/lib/pontos.ts).

Esses números são só um ponto de partida; para ajustá-los depois, é preciso mudar a função `responder_questionario` no banco (rode a alteração pelo SQL Editor do Supabase).

---

## 7. Estrutura do projeto

```
src/
  app/
    page.tsx                → Início (versículo do dia, progresso, atalhos)
    login/, cadastro/        → Autenticação
    encontros/                → Listagem com filtros + detalhe
    galeria/                  → Galeria de fotos
    questionarios/            → Listagem + responder
    ranking/                  → Ranking de pontos da comunidade
    perfil/                   → Perfil e histórico do catequizando
    admin/                    → Painel administrativo (temas, encontros, versículos, galeria, questionários e acesso)
  components/                 → Componentes reutilizáveis (Header, filtros, formulário de quiz, terço de progresso)
    admin/                    → Formulários e listas usados só no painel administrativo
  lib/
    supabase/                 → Clientes Supabase (browser, server, middleware) e tipos
    pontos.ts                 → Regras de pontuação
supabase/
  schema.sql                  → Schema completo do banco (tabelas + segurança + dados de exemplo)
```

---

## Próximos passos sugeridos

- Notificações por e-mail lembrando do encontro da semana.
- Exportar certificado de participação ao final do ano de catequese.
