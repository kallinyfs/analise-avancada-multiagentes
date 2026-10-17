# Relatório do Revisor independente — rodada 05

## Versão examinada

Sem commit Git. Os hashes de produto e testes conferem com os relatórios de Construtor/Tester. Minha execução regenerou `browser-evidence.json`; seu hash é o da execução abaixo.

| Arquivo | SHA-256 |
|---|---|
| `papelaria_limpa.csv` | `698BB401D35C644C9B4F9414B96D3236E02EBCA6E0878CDD51C12B6EF259C2AD` |
| `projeto-dashboard/site/data.json` | `5E7451C1984123516BB68D17070053F237BE47CFD616E6B40E113533444EA120` |
| `projeto-dashboard/site/app.js` | `75EE042CD20D10F4CB7D1AA498AC0116E8425CC431C50933A66B13690E72AF2C` |
| `projeto-dashboard/site/index.html` | `4F22A12FAEAC6ED84F257FB4EC3993B0D060B0CBE3261A1C37D0BE68EB04D5CA` |
| `projeto-dashboard/site/styles.css` | `31A3CEC0C9A995304115D53798A6478372D2D33806EF19FACA665A378D65295F` |
| `projeto-dashboard/tests/test_dashboard.py` | `571275945DCDD3A0D76466DDD987AB71CC2EBDBBAB1166E10F3ADC5D718D9BAE` |
| `projeto-dashboard/tests/browser_test.js` | `DC54CAC9E3031A4D211D5445F210439A9F3324EC3F24F1B7A98BA4DAF6ABA309` |
| `projeto-dashboard/tests/browser-evidence.json` (após minha suíte) | `AD51873F4D2DE20D37673BE5219F4A3642B46867F05C9815591CAF2A116B6971` |
| `projeto-dashboard/relatorios/rodada-05/construtor.md` | `84C272AD7C1EDEA4F6CA881BC6D0C8D56DF746CC0218B83D98CCB6EE1323270F` |
| `projeto-dashboard/relatorios/rodada-05/tester.md` | `0778645BC8F8AD6AB8B6F0ABC8701535DCD4CE93B5686AD1554DC4104AC8D674` |

## Verificações executadas

- `node --check projeto-dashboard\site\app.js` e `node --check projeto-dashboard\tests\browser_test.js` — **OK**.
- `& .\.venv\Scripts\python.exe -m unittest discover -s projeto-dashboard\tests -v` — **OK: 7 passaram, 0 falharam e 0 ignorados** (5,137 s), incluindo Chromium real. Evidência regenerada: `projeto-dashboard/tests/browser-evidence.json`, `result: PASS`, caso `selected-empty-month-after-dimension-filters`, viewports 390×844 e 1440×900, `runtimeErrors: []`.
- Recalculei diretamente o CSV com Python `csv`/`Decimal`: 180 linhas, 180 IDs únicos, total 2.005.900 centavos; Santos + Caneta: Jan 3 vendas/3.850 centavos, Fev 8/9.100, Mar 0/0. Comparei exportação preparada: 180 registros, IDs/valores correspondem à fonte. Hashes da fonte e de `data.json` preservados.
- Inspecionei o fluxo corrigido de `site/app.js` e as asserções de regressão em `tests/browser_test.js`; não alterei produto, testes nem relatórios anteriores.

## Revisão da correção da rodada-04

**Caso Santos + Caneta + março/2026: aprovado.** A suíte real do Chromium seleciona exatamente os três filtros e confronta os resultados com o CSV. Janeiro e fevereiro permanecem na série; março aparece como ponto zero selecionado (`aria-pressed=true` e classe selecionada). O resumo identifica março como selecionado e sem vendas, sem chamar fevereiro de mês mais recente. O rótulo visível do ponto informa `0 vendas`; o `<title>` e o `aria-label` do botão SVG informam março e R$ 0,00/ausência de vendas. Os três KPIs e a tabela/contador ficam em zero; a comparação com fevereiro é conferida para valor, número de vendas e ticket (−100%).

Quando os filtros dimensionais deixam `dadosBase` completamente vazio, o código retorna ao estado “Sem dados para exibir” sem criar pontos artificiais; a regressão existente de combinação vazia e o helper conferem os quatro gráficos vazios. A execução integral passou nesses dois estados.

## Reavaliação das observações da rodada-04

- **Eixo/tooltip SVG:** mantêm-se o eixo horizontal e a linha de grade, rótulos dos meses, resumo, ponto focável, `<title>` nativo e nome acessível. A regressão confere título/aria com mês e valor no ponto zero. Continua sem escala numérica/ticks no eixo vertical; valores exatos seguem disponíveis ao focar/passar sobre os pontos. Recomendar ticks monetários permanece melhoria visual não bloqueante, não pendência de aprovação.
- **Links e paleta:** links GitHub/LinkedIn e seus nomes acessíveis continuam no HTML; CSS preserva a paleta azul/branca e os estilos de foco/hover.
- **Tabela integral:** mantenho a conclusão da rodada-04: 180 linhas sem busca/ordenação/paginação é aceitável neste escopo, com filtros, contador, cabeçalho fixo, rolagem e preservação de todas as linhas. Busca/ordenação seguem melhorias opcionais, não defeitos impeditivos.

## Achados, encaminhamento e status

Não encontrei defeito novo nem pendência para Construtor ou Tester. Os relatórios da rodada-05, a versão testada, a evidência e os hashes coincidem; a revisão não alterou produto/testes. O eixo sem ticks numéricos fica registrado como melhoria não bloqueante.

**APROVADO — revisão independente da versão da rodada-05.** O achado da rodada-04 foi corrigido e coberto por regressão; suíte integral e verificações independentes passaram. A aprovação conjunta/status final do projeto cabe ao coordenador.
