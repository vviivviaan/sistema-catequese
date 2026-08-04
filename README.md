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

## 4. Cadastrando conteúdo (encontros, versículos, fotos, questionários)

Nesta primeira versão, o cadastro de conteúdo é feito diretamente pelo **Table Editor** do Supabase (painel visual, sem precisar escrever SQL):

- **`temas`**: nome do tema (ex: "Sacramentos") e uma cor opcional.
- **`encontros`**: título, resumo, conteúdo (texto completo do encontro), `tema_id` (escolha um tema já criado) e `data_encontro`.
- **`versiculos`**: referência (ex: "João 3:16"), texto e `data_exibicao` (a data em que ele aparecerá na tela inicial).
- **`fotos_galeria`**: título, `data_evento` e `url_imagem` (suba a foto no bucket `galeria` do Storage e cole aqui a URL pública gerada).
- **`questionarios`**: título e `encontro_id` (a qual encontro ele pertence).
- **`perguntas`**: `questionario_id`, enunciado, `ordem`, `opcoes` (lista de alternativas) e `resposta_correta` (índice da alternativa certa, começando em 0).

> Se no futuro vocês quiserem uma tela de administração dentro do próprio site (em vez do painel do Supabase), é só pedir — dá para construir como uma segunda etapa, com um perfil de "catequista/administrador".

---

## 5. Publicar no Vercel

1. Suba este projeto para um repositório no GitHub (ou GitLab/Bitbucket).
2. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o repositório.
3. Em **Environment Variables**, adicione as duas mesmas variáveis do `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**. Em cerca de 1 minuto o site estará no ar em um endereço `.vercel.app`.
5. Opcional: em **Project Settings → Domains**, adicione um domínio próprio (ex: `catequeseadultos.org.br`, se a paróquia adquirir um).

---

## 6. Sistema de pontos

As regras ficam centralizadas em [`src/lib/pontos.ts`](./src/lib/pontos.ts):

- **10 pontos** por pergunta correta no questionário.
- **+20 pontos de bônus** ao acertar 100% de um questionário.
- Os pontos acumulados também "acendem" contas no terço de progresso exibido no perfil e na tela inicial (a cada 30 pontos, uma conta se acende) — o elemento visual de identidade do sistema.

Esses números são só um ponto de partida; é fácil ajustá-los depois.

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
  components/                 → Componentes reutilizáveis (Header, filtros, formulário de quiz, terço de progresso)
  lib/
    supabase/                 → Clientes Supabase (browser, server, middleware) e tipos
    pontos.ts                 → Regras de pontuação
supabase/
  schema.sql                  → Schema completo do banco (tabelas + segurança + dados de exemplo)
```

---

## Próximos passos sugeridos

- Painel de administração no próprio site para o catequista cadastrar encontros, fotos e questionários sem usar o Supabase diretamente.
- Notificações por e-mail lembrando do encontro da semana.
- Exportar certificado de participação ao final do ano de catequese.
