# Relatório do Revisor independente — rodada 04

## Versão examinada

Sem commit Git neste workspace. Os hashes da implementação coincidem com os informados pelo Construtor e Tester. A execução independente da suíte regenerou `browser-evidence.json` (a URL/porta local muda a cada execução).

| Arquivo | SHA-256 da versão examinada |
|---|---|
| `papelaria_limpa.csv` | `698BB401D35C644C9B4F9414B96D3236E02EBCA6E0878CDD51C12B6EF259C2AD` |
| `projeto-dashboard/site/data.json` | `5E7451C1984123516BB68D17070053F237BE47CFD616E6B40E113533444EA120` |
| `projeto-dashboard/site/index.html` | `4F22A12FAEAC6ED84F257FB4EC3993B0D060B0CBE3261A1C37D0BE68EB04D5CA` |
| `projeto-dashboard/site/app.js` | `0DA907DA89BD110070BCCD489F8AA86F2B30FDFE980C6685F09244EDE8CD7A46` |
| `projeto-dashboard/site/styles.css` | `31A3CEC0C9A995304115D53798A6478372D2D33806EF19FACA665A378D65295F` |
| `projeto-dashboard/tests/test_dashboard.py` | `CB1981383DECB5280B7E12EF3BBE088F896C39525B46BD1B0B7D88DD84FA7FF8` |
| `projeto-dashboard/tests/browser_test.js` | `9D86B2D3D39F739B62D47F376BEFFF8B08B8008B065D9D3CB23B356789FA2A72` |
| `projeto-dashboard/tests/browser-evidence.json` (após minha suíte) | `2D39617146DA926A74EABB8C8D11A947530C6E009E64D41EB9E6FFCC50B93482` |
| `projeto-dashboard/relatorios/rodada-04/test-plan.md` | `66C8272CDE20F837557C368C5888770A409E2C079EB884443560E209FC97F3EF` |
| `projeto-dashboard/relatorios/rodada-04/validacao-base.md` | `60ED644C0015EADF240851207211A0A4CA15AAAEAC3DC7B668C27E1F8AF9D236` |

## Verificações independentes e evidências

- `node --check projeto-dashboard\site\app.js` e `node --check projeto-dashboard\tests\browser_test.js` — **OK**.
- `& .\.venv\Scripts\python.exe -m unittest discover -s projeto-dashboard\tests -v` — **OK: 7 testes passaram, 0 falharam e 0 foram ignorados** (4,902 s). Inclui Chromium real. A execução regenerou `tests/browser-evidence.json`; resultado `PASS`, viewports 390×844 e 1440×900, `runtimeErrors: []`. Arquivo de evidência: `projeto-dashboard/tests/browser-evidence.json`.
- Recalculei mês e Pareto diretamente de `papelaria_limpa.csv` em Python com `csv`/`Decimal`, sem importar a lógica de preparação/dashboard. Resultado: Jan/2026 R$ 6.235,00/62 vendas; Fev R$ 6.181,00/56; Mar R$ 7.643,00/62. Total R$ 20.059,00. Pareto por produto: Mochila R$ 8.075,00 (40,26%); Livro de aventuras R$ 4.578,00 (22,82%; acumulado 63,08%); Livro de receitas R$ 2.860,00; Estojo R$ 2.442,00 (acumulado 89,51%); Caderno R$ 1.782,00; Caneta R$ 322,00 (acumulado 100%). Confere com `validacao-base.md` e os oráculos dos testes.
- Conferi os hashes de produto, fonte e dados com os relatórios de Construtor/Tester. A suíte não alterou esses arquivos; somente regenerou a evidência do navegador.

## Revisão do produto e achados

### P2 — mês selecionado sem linhas não aparece na tendência (encaminhar ao Construtor; regressão ao Tester)

**Exemplo concreto a reproduzir na interface:** selecione Cidade `Santos`, Produto `Caneta` e Mês `março de 2026`. Recalculei a fonte: Santos + Caneta tem 3 vendas/R$ 38,50 em janeiro, 8/R$ 91,00 em fevereiro e nenhuma em março. Portanto o recorte selecionado tem zero linhas e os KPIs/tabela ficam vazios.

Em `site/app.js`, `atualizar()` chama `desenharTendencia(dadosBase)`, excluindo o filtro de mês intencionalmente; a série deriva seus meses apenas das linhas que restaram após os filtros de dimensão (`desenharTendencia`, linhas 191–203). Como março não consta em `dadosBase`, `selecionadoNoGrafico` fica vazio e o gráfico conserva só janeiro/fevereiro. O resumo passa a dizer “Fevereiro de 2026 … mês mais recente”, embora março esteja selecionado e o recorte atual não tenha vendas. Assim, o estado do período selecionado não é comunicado no gráfico temporal; o caso não está entre os cenários do `browser_test.js` (a combinação vazia testada não seleciona mês).

O caminho é determinístico pelo código e pelos dados; não alego que esse caso específico foi executado no navegador nesta revisão. Correção sugerida: representar explicitamente que o mês selecionado não tem vendas no recorte (sem apresentar fevereiro como período selecionado), preservando a série histórica/contexto; acrescentar regressão automatizada que confronte resumo, pontos, comparação, KPIs e tabela com o CSV para esse caso. **Encaminhar ao Construtor e ao Tester; até corrigir e repetir os testes afetados, esta versão fica REPROVADA.**

### Observações sem bloqueio separado

- **SVG/eixos, rótulos e tooltip:** há eixo horizontal e linha de grade, rótulos textuais dos meses, resumo textual e `<title>`/`aria-label` com mês e valor em cada ponto. Não há escala numérica/ticks no eixo vertical; a leitura dos valores históricos depende de passar o mouse/focar o ponto. O teste confere `title` e nomes acessíveis, mas não comprova visualmente o tooltip nativo nem a leitura da escala. Sugestão de melhoria: incluir marcações monetárias no eixo vertical e testar a exposição do valor ao hover/foco. Não considerei isso bloqueio isolado, pois os valores podem ser consultados no ponto e no resumo.
- **Teclado/semântica/hover:** linhas interativas usam `role="button"`, `tabindex`, nome e estado acessíveis; pontos SVG têm foco, `aria-pressed`, Enter/Espaço; o teste de browser confirma drill-down, foco, hover e limpeza. A interação atual de mouse/teclado retorna foco aos filtros.
- **Responsividade e identidade:** CSS mantém a paleta azul/branca e o layout responsivo; links GitHub/LinkedIn e favicon permanecem. A evidência atual confirma 390×844 e 1440×900 sem overflow horizontal da página.
- **Tabela (180 linhas sem busca/ordenação/paginação):** considero aceitável para esta entrega, não uma falha de requisito. O conjunto é pequeno, a tabela mantém os 180 registros sem perda, tem cabeçalho fixo e rolagem vertical/horizontal, contador e quatro filtros que reduzem o recorte. Busca por ID/pagamento e ordenação facilitariam a localização de uma linha, mas são melhorias opcionais; paginação poderia tornar a conferência integral menos direta. O testador corretamente não declarou esses recursos como presentes.
- **Metodologia e sincronização:** uma venda é uma linha/ID; soma, contagem e ticket estão rotulados corretamente, sem chamar valor vendido de lucro. Os quatro filtros atualizam KPIs, rankings e tabela com o mesmo subconjunto; comparações têm guarda para ausência de mês anterior/denominador zero. A inconsistência identificada limita-se ao período ausente na série temporal descrito acima.

## Encaminhamento e status

- **Construtor:** corrigir a apresentação da tendência para mês selecionado sem vendas após filtros de dimensão.
- **Tester:** acrescentar o caso `Santos + Caneta + Março/2026` (3 vendas/R$ 38,50 em Jan; 8/R$ 91,00 em Fev; 0 em Mar), validando visualização/período vazio e sincronização. Reexecutar suíte integral após a correção.
- **PENDENTE:** confirmação interativa independente do cenário específico acima; a suíte de browser executada passou, mas não o cobre. Nenhuma alteração foi feita em produto ou testes.

**REPROVADO — a versão tem uma inconsistência reproduzível no estado de período sem vendas e precisa retornar ao Construtor e Tester.** A suíte executada passou, mas não cobre esse cenário. Não é aprovação conjunta da rodada.
