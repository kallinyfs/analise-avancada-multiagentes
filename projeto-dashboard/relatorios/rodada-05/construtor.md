# Relatório do Construtor — rodada 05

## Versão examinada

Sem commit Git. SHA-256 finais:

| Arquivo | SHA-256 |
|---|---|
| `projeto-dashboard/site/app.js` | `75EE042CD20D10F4CB7D1AA498AC0116E8425CC431C50933A66B13690E72AF2C` |
| `papelaria_limpa.csv` (preservado) | `698BB401D35C644C9B4F9414B96D3236E02EBCA6E0878CDD51C12B6EF259C2AD` |
| `projeto-dashboard/site/data.json` (preservado) | `5E7451C1984123516BB68D17070053F237BE47CFD616E6B40E113533444EA120` |

## Correção

- Se os filtros de dimensão deixam histórico, mas o mês escolhido não tem linhas, a tendência agora inclui esse mês no domínio com valor zero, sem alterar os dados. O resumo identifica o mês escolhido e informa que não há vendas no recorte; o ponto exibe `0 vendas`.
- O tooltip SVG e o nome acessível do ponto informam ausência de vendas, valor zero e que o mês está selecionado. O período selecionado não é substituído pelo mês histórico mais recente.
- Se os filtros dimensionais deixam o conjunto totalmente vazio, a tendência continua no estado “Sem dados para exibir”, sem criar pontos artificiais. A lógica de comparação mensal, KPIs, rankings e tabela não foi alterada.
- Alterado somente `site/app.js`; CSV e `site/data.json` permanecem intactos.

## Comandos e evidências

- `node --check projeto-dashboard/site/app.js` — **OK**.
- Harness Node.js temporário em VM, carregando `app.js` e `site/data.json` e aplicando Cidade `Santos` + Produto `Caneta` + Mês `2026-03` — **PASS**. Confirmou pontos Jan/Fev/Mar; resumo de março sem vendas; ponto de março selecionado com `aria-pressed`, nome acessível, `<title>` e rótulo visível `0 vendas`; KPI e tabela vazios; comparação do valor total **-100% vs. R$ 91,00**. O mesmo harness conferiu que, sem qualquer registro após os filtros dimensionais, não aparece ponto artificial e o estado vazio é mantido.
- As primeiras verificações do harness precisaram de ajustes no próprio mock para refletir `class`/`textContent` do DOM e a formatação percentual real do `Intl`; a execução corrigida passou e está resumida acima.
- `Get-FileHash -Algorithm SHA256 ...` — hashes acima; fonte e dados preparados mantêm os hashes da rodada anterior.
- Suíte completa, navegador real e regressão independente: **PENDENTES**, a cargo do Tester. Não alterei testes nem relatórios de outros agentes.

## Status

**APROVADO — correção do Construtor.** A suíte completa e a revisão independente desta versão permanecem **PENDENTES**; não há aprovação conjunta nesta etapa.
