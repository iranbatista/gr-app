# Comparar desafios — Design

Data: 2026-10-28
Status: aprovado

## Objetivo

Comparar dois desafios lado a lado, no nível do grupo e de cada atleta, de forma justa
mesmo quando um deles ainda está em andamento.

## Rota e entrada

- `/comparar?a=<id>&b=<id>&modo=dia|total` (BrowserRouter, base `/gr-app/`).
- Topo: dois `Select` de desafio (capa em miniatura + nome + período) e botão inverter
  (lucide `ArrowLeftRight`, nome "Inverter desafios").
- Default sem params: A = desafio ativo mais recente, B = o anterior por `start_date`.
- Entradas: botão "Comparar" na lista de desafios; "Comparar com…" no hero do desafio
  (A = aquele desafio, B = o anterior a ele).
- Cores fixas: A = laranja da marca, B = tinta neutra (`--ink-muted`), em todos os gráficos e badges.

## Modo de alinhamento

- `dia` (default quando A ou B está em andamento): compara até o dia N, onde
  N = dias decorridos do desafio em andamento (se ambos em andamento, o menor N).
  Rótulo: "Até o dia 25". Datas de corte: `start_date + N - 1` de cada desafio.
- `total`: desafios inteiros. Rótulo: "Desafio inteiro".
- Se nenhum está em andamento, default `total` e o seletor continua disponível
  (`dia` usa o menor número de dias entre os dois).

## Backend (gr-api)

- Parâmetro opcional `until=YYYY-MM-DD` em `GET /challenges/{cid}/stats` e
  `GET /challenges/{cid}/insights`: considera só check-ins com dia local <= until.
  Data inválida → 422.
- As duas respostas ecoam `until` (null quando ausente), para o front confirmar que o
  corte foi aplicado.
- Em `/insights` com `until`, "hoje" para sequência atual = `until`.

## Seções

1. **Placar** — cards A × B com variação %: check-ins; atletas ativos / membros;
   participação média diária (% de membros ativos por dia); check-ins por atleta;
   horas treinadas; duração média por check-in.
2. **Ritmo** — linhas sobrepostas por "Dia 1…N": check-ins acumulados; participação
   diária %. Tooltip com A e B no mesmo dia.
3. **Quando o grupo treina** — períodos do dia em barras agrupadas A × B; horário de
   pico de cada um; duração média por dia da semana agrupada.
4. **Destaques** — tabela: prêmio | vencedor A (avatar, nome, valor) | vencedor B.
5. **Atletas** — casamento por `account_id`.
   - Resumo: "40 nos dois · 8 novos · 7 saíram" (novos = só em A, saíram = só em B).
   - Cards "Mais evoluíram" e "Mais caíram" (top 3 por Δ check-ins entre os que estão nos dois).
   - Tabela paginada (10): Atleta | Check-ins A | Check-ins B | Δ | Dias ativos A / B |
     Posição A / B com seta. Filtro (Nos dois / Novos / Saíram). Ordenação por Δ.
   - Posição: no modo `dia`, recalculada por check-ins até o corte (empate = mesma
     posição); no modo `total`, ranking oficial do GymRats.

## Fontes de dados

Por desafio: `/challenges/{id}`, `/challenges/{id}/insights?until=`, `/challenges/{id}/stats?until=`,
`/challenges/{id}/rankings` (modo total). Lógica pura em `src/lib/compare.ts` com testes.

## Estados

Skeleton espelhando o layout; erro por seção com retry; A == B → aviso "Escolha dois
desafios diferentes"; backend sem `until` (resposta sem eco) → modo `dia` desabilitado
com tooltip "Disponível após atualizar a API".
