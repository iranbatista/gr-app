# gr-app — Design

Data: 2026-10-27
Status: aprovado

## Objetivo

Dashboard pessoal (uso exclusivo do dono) em React para visualizar os desafios do GymRats
servidos pela API read-only `gr-api` em `https://gr-api.iranbatista.dev`.

## Contexto da API

- FastAPI, somente GET. Todas as rotas de dados exigem header `X-API-Key`; `/health` e
  `/openapi.json` são públicos.
- CORS já libera `https://iranbatista.github.io` (verificado em 2026-10-27).
- Dados atualizados por sync a cada 60 min.

| Rota | Uso no app |
|---|---|
| `GET /challenges` | lista de desafios |
| `GET /challenges/{id}` | header do desafio |
| `GET /challenges/{id}/rankings` | aba Ranking |
| `GET /challenges/{id}/stats` | aba Gráficos e totais do membro |
| `GET /challenges/{id}/workouts?limit&offset&member_id&since&until` | aba Feed e histórico do membro |
| `GET /meta/sync` | indicador de última sincronização |

`/challenges/{id}/members` não é usado na v1: o filtro de membro do feed é populado a partir
do ranking (que já traz `account.id`, nome e avatar).

## Decisões

| Tema | Decisão |
|---|---|
| Hospedagem | GitHub Pages, repo `gr-app`, URL `https://iranbatista.github.io/gr-app/` |
| API key | Embutida no build via GitHub Secret `GYMRATS_KEY` → `VITE_GYMRATS_KEY` |
| Stack | Vite + React + TypeScript + TanStack Query + React Router + Recharts + Tailwind |
| Roteamento | `HashRouter` (Pages não tem fallback de SPA); Vite `base: '/gr-app/'` |
| Tipos | Gerados de `https://gr-api.iranbatista.dev/openapi.json` via `openapi-typescript` (`npm run gen:api`), arquivo versionado |
| Capa do desafio | `profile_picture_url` do desafio; fallback gradiente determinístico a partir do nome |

### Risco aceito: API key pública

A chave entra no bundle JS servido publicamente pelo Pages. Qualquer pessoa com a URL pode
extraí-la e ler os dados do grupo (nomes, fotos, check-ins dos membros). Aceito pelo dono para
uso pessoal. Mitigação futura, se necessário: chave digitada em runtime e guardada em
`localStorage`, ou proxy no Caddy injetando a chave. Rotação: gerar nova chave no `.env` da VPS,
`docker compose up -d`, atualizar o secret e redeployar.

## Estrutura

```
gr-app/
├─ .github/workflows/deploy.yml
├─ src/
│  ├─ api/
│  │  ├─ schema.d.ts       # gerado
│  │  ├─ client.ts         # apiGet + ApiError
│  │  └─ queries.ts        # hooks TanStack Query
│  ├─ routes/              # ChallengesPage, ChallengePage, MemberPage
│  ├─ components/          # Avatar, Cover, Skeleton, ErrorState, EmptyState, SyncFooter, charts...
│  ├─ lib/format.ts        # datas, duração, distância, "há X min"
│  └─ main.tsx             # QueryClientProvider + HashRouter
├─ vite.config.ts
└─ .env.example            # VITE_API_URL, VITE_GYMRATS_KEY
```

## Telas

| Rota | Conteúdo | Endpoints |
|---|---|---|
| `#/` | Grid de cards: capa, nome, período, nº de membros, badge **Ativo**/**Encerrado** (por `end_date` vs hoje; sem `end_date` = Ativo). Ordem da API (mais recentes primeiro). | `/challenges` |
| `#/c/:id` | Header com capa, nome, descrição, período, nº membros. Abas **Ranking · Gráficos · Feed**, aba ativa em `?tab=` (default `ranking`). | `/challenges/{id}` |
| — aba Ranking | Lista: posição, avatar, nome, score. Clique leva à página do membro. | `/rankings` |
| — aba Gráficos | Check-ins por dia (barras) e check-ins por membro (barras horizontais), totais (`total_workouts`, `members`). | `/stats` |
| — aba Feed | Cards de check-in: foto (se houver), membro, título/atividade, data, duração, distância, calorias, pontos. Filtros membro / desde / até na query string (`member`, `since`, `until`). "Carregar mais" (limit 30). | `/workouts` |
| `#/c/:id/m/:memberId` | Avatar e nome, totais (check-ins, pontos, calorias, distância) de `stats.by_member`, gráfico de check-ins por dia derivado dos workouts do membro, histórico paginado. | `/stats`, `/workouts?member_id=` |
| global | Rodapé "Sincronizado há X min". | `/meta/sync` |

Avatar/nome do membro na página do membro: vêm do ranking (`account`) do desafio.
O gráfico por dia do membro usa uma query dedicada `['workouts', id, { member, all: true }]`
com `limit=1000` (máximo da API), independente da paginação do histórico.

## Dados

### Client

- `apiGet<T>(path, params?)`: URL base `VITE_API_URL`, header `X-API-Key: VITE_GYMRATS_KEY`,
  params `undefined`/vazios omitidos.
- Resposta não-ok → `throw new ApiError(status, detail)` (`detail` do corpo JSON do FastAPI,
  fallback `statusText`). Falha de rede → `ApiError(0, ...)`.
- `VITE_GYMRATS_KEY` vazio no build → banner de erro fixo no topo do app.

### TanStack Query

- `staleTime: 5 min`, `refetchOnWindowFocus: false`.
- `retry`: até 1 vez para status 0 e ≥ 500; nunca para 4xx.
- Keys: `['challenges']`, `['challenge', id]`, `['rankings', id]`, `['stats', id]`,
  `['workouts', id, { member, since, until }]`, `['sync']`.
- Feed e histórico usam `useInfiniteQuery`, `limit 30`, próxima página enquanto
  `offset + items.length < total`.

## Estados de UI

| Estado | Tratamento |
|---|---|
| loading | Skeletons no formato do conteúdo |
| 401 | "API key inválida ou ausente no build" |
| 404 | "Desafio/membro não encontrado" + link para `#/` |
| rede / 5xx | Mensagem + botão "Tentar de novo" (`refetch`) |
| vazio | Mensagem específica ("Nenhum check-in ainda", etc.) |
| imagem falha | `Avatar` → iniciais; `Cover` → gradiente |

## Formatação

`Intl` com locale `pt-BR`. Datas `dd/mm/aaaa`; duração em minutos → `1h 20min`; distância
com 1 casa + unidade; calorias inteiras + `kcal`; sync relativo ("há 12 min").
As unidades de `duration` e `distance` serão confirmadas contra dados reais na implementação;
se divergirem, ajusta-se apenas `format.ts`.

## Deploy

`.github/workflows/deploy.yml`:
- Gatilhos: push em `main` e `workflow_dispatch`.
- `npm ci` → `npm test` → `npm run build` com `VITE_API_URL=https://gr-api.iranbatista.dev`
  e `VITE_GYMRATS_KEY=${{ secrets.GYMRATS_KEY }}` → `actions/upload-pages-artifact` →
  `actions/deploy-pages`.

Setup manual (dono, uma vez): criar repo `gr-app` no GitHub, adicionar secret `GYMRATS_KEY`,
Settings → Pages → Source: GitHub Actions.

## Testes

Vitest + Testing Library + MSW.
- `client`: envia header, mapeia erros (401, 404, 500, rede), omite params vazios.
- `format`: duração, distância, datas, relativo.
- Cada tela: loading, erro, vazio, sucesso (com handlers MSW).
- Sem E2E na v1.

## Fora de escopo (v1)

Autenticação de usuários, escrita na API, PWA/offline, i18n além de pt-BR, modo escuro, E2E.
