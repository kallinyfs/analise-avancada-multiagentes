# Relatório do Tester — rodada 05

## Versão e escopo

Sem commit Git. Caso de regressão encaminhado pelo Revisor da rodada 04: Cidade `Santos` + Produto `Caneta` + Mês `2026-03`; o CSV tem 3 vendas/R$ 38,50 em janeiro, 8/R$ 91,00 em fevereiro e nenhuma em março.

Foram alterados somente `projeto-dashboard/tests/browser_test.js` e `projeto-dashboard/tests/test_dashboard.py`. Produto e relatórios anteriores não foram editados. O Construtor já entregou `relatorios/rodada-05/construtor.md`; sua correção acrescenta um ponto zero ao mês selecionado quando há histórico nas dimensões e informa o estado em resumo, tooltip e nome acessível.

## Mudanças de cobertura

- O teste de navegador calcula os três recortes independentemente do CSV, em centavos, e verifica os totais conhecidos: janeiro 3/R$ 38,50; fevereiro 8/R$ 91,00; março 0/R$ 0,00.
- Seleciona as três dimensões/período e confere valor do select, KPIs/tabela/contagem vazios, comparações dos três KPIs contra fevereiro, preservação dos pontos de janeiro/fevereiro e inclusão do ponto de março com valor zero, seleção visual e `aria-pressed`.
- Confere que o resumo, `<title>` do SVG e `aria-label` identificam março/zero e não anunciam fevereiro como “mês mais recente”. Ajusta o helper de tendência para acrescentar o mês selecionado zero apenas quando há histórico das dimensões; combinação sem histórico continua sendo estado vazio. Contagens de placeholders passam a refletir corretamente os três rankings vazios e a série histórica disponível.
- A asserção genérica de tooltip verifica mês e valor, sem exigir texto literal: o Construtor ampliou a descrição com “vendidos”/“sem vendas”, mantendo os dados esperados. Não houve enfraquecimento de valor ou cobertura dos testes anteriores.

## Comandos iniciais e evidências

- Oráculo independente executado com Python `csv` + `Decimal` sobre `papelaria_limpa.csv`: `2026-01 3 3850`, `2026-02 8 9100`, `2026-03 0 0` (contagem e centavos).
- `node --check projeto-dashboard\tests\browser_test.js` — OK antes da última adaptação de texto; será repetido na suíte final.
- A primeira execução da suíte enquanto o Construtor terminava a alteração parou na asserção textual antiga do tooltip (`...R$ 6.235,00 vendidos.` versus a expectativa rígida sem sufixo). Não chegou ao caso de março; portanto não é evidência de falha da correção nem reprodução pré-correção. A expectativa foi ajustada para comparar mês e montante, preservando o critério.
- O primeiro snapshot do `app.js` ainda era da rodada 04, mas o Construtor concluiu a mudança antes da execução do browser: `rodada-05/construtor.md` e o hash novo (`75EE042C...`) confirmam a entrega. Não afirmo reprodução interativa pré-correção.

## Versão final verificada

Sem commit Git. SHA-256 após a execução final:

| Arquivo | SHA-256 |
|---|---|
| `papelaria_limpa.csv` | `698BB401D35C644C9B4F9414B96D3236E02EBCA6E0878CDD51C12B6EF259C2AD` |
| `projeto-dashboard/site/data.json` | `5E7451C1984123516BB68D17070053F237BE47CFD616E6B40E113533444EA120` |
| `projeto-dashboard/site/app.js` | `75EE042CD20D10F4CB7D1AA498AC0116E8425CC431C50933A66B13690E72AF2C` |
| `projeto-dashboard/site/index.html` | `4F22A12FAEAC6ED84F257FB4EC3993B0D060B0CBE3261A1C37D0BE68EB04D5CA` |
| `projeto-dashboard/site/styles.css` | `31A3CEC0C9A995304115D53798A6478372D2D33806EF19FACA665A378D65295F` |
| `projeto-dashboard/tests/test_dashboard.py` | `571275945DCDD3A0D76466DDD987AB71CC2EBDBBAB1166E10F3ADC5D718D9BAE` |
| `projeto-dashboard/tests/browser_test.js` | `DC54CAC9E3031A4D211D5445F210439A9F3324EC3F24F1B7A98BA4DAF6ABA309` |
| `projeto-dashboard/tests/browser-evidence.json` | `5319E08B89C67DED3B91FEDCB518EBA85DC0E2EAA512B8E749AE19B2713A49A2` |
| `projeto-dashboard/relatorios/rodada-05/construtor.md` | `84C272AD7C1EDEA4F6CA881BC6D0C8D56DF746CC0218B83D98CCB6EE1323270F` |

## Comandos e resultados finais

- `& .\.venv\Scripts\python.exe projeto-dashboard\preparar_dados.py` — **OK**; 180 linhas, R$ 20.059,00 e ticket R$ 111,44. `data.json` tinha hash `5E7451...EA120` antes da preparação e o mesmo hash depois; o CSV manteve o hash integral registrado acima.
- `& .\.venv\Scripts\python.exe -m unittest discover -s projeto-dashboard\tests -v` — **OK: 7 testes passaram, 0 falharam, 0 foram ignorados** (5,052 s). Inclui execução real em Chromium; validou também HTTP/404, dados em centavos, duplicatas, tipos, exemplo conhecido e dados exportados.
- `node --check projeto-dashboard\site\app.js` e `node --check projeto-dashboard\tests\browser_test.js` — **OK**. Ambos também são conferidos dentro da suíte Python.
- Regressão interativa real `Santos + Caneta + março/2026`: oráculo CSV confirmou Jan **3/R$ 38,50**, Fev **8/R$ 91,00**, Mar **0/R$ 0,00**. Os filtros permaneceram selecionados; KPIs e tabela/contador ficaram em zero. As comparações conferiram março vs. fevereiro para total (**−100,0% vs. R$ 91,00**), vendas (**−100,0% vs. 8 vendas**) e ticket (**−100,0% vs. R$ 11,38**).
- A série SVG manteve os pontos Jan/Fev com valores recalculados do CSV e incluiu Março em zero. O ponto de março foi marcado como selecionado (`aria-pressed=true` e classe selecionada); tooltip e `aria-label` contêm março e R$ 0,00. O resumo identifica março e zero sem chamar fevereiro de “mês mais recente”.
- Os demais casos preservados passaram: filtros isolados/combinados, vazio real, limpar, cards/gráficos/Pareto/tabela, seleção mensal, drill-down mouse/teclado, Tab/foco, hover, ausência de `NaN`/`Infinity`/`undefined`, erros JavaScript/console e viewports 390×844 e 1440×900. Evidência: `tests/browser-evidence.json`, `result: PASS`, `runtimeErrors: []`; registra a nova regressão em `cases`.
- A execução integral intermediária falhou por duas inconsistências do helper de teste (parâmetros da comparação e texto adicional no tooltip); ambas foram corrigidas somente nos testes. A execução final completa passou. Não encontrei defeito de produto nem encaminhamento pendente ao Construtor.

## Status

**APROVADO — escopo do Tester para os hashes acima.** A revisão independente desta correção e a aprovação conjunta permanecem a cargo do Revisor; este resultado não atualiza o status final geral.
