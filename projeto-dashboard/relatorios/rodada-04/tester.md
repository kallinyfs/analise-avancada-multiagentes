# Relatório do Tester — rodada 04

## Versão examinada

Sem commit Git neste workspace. SHA-256 da versão verificada:

| Arquivo | SHA-256 |
|---|---|
| `papelaria_limpa.csv` | `698BB401D35C644C9B4F9414B96D3236E02EBCA6E0878CDD51C12B6EF259C2AD` |
| `projeto-dashboard/site/data.json` | `5E7451C1984123516BB68D17070053F237BE47CFD616E6B40E113533444EA120` |
| `projeto-dashboard/site/index.html` | `4F22A12FAEAC6ED84F257FB4EC3993B0D060B0CBE3261A1C37D0BE68EB04D5CA` |
| `projeto-dashboard/site/app.js` | `0DA907DA89BD110070BCCD489F8AA86F2B30FDFE980C6685F09244EDE8CD7A46` |
| `projeto-dashboard/site/styles.css` | `31A3CEC0C9A995304115D53798A6478372D2D33806EF19FACA665A378D65295F` |
| `projeto-dashboard/tests/test_dashboard.py` | `CB1981383DECB5280B7E12EF3BBE088F896C39525B46BD1B0B7D88DD84FA7FF8` |
| `projeto-dashboard/tests/browser_test.js` | `9D86B2D3D39F739B62D47F376BEFFF8B08B8008B065D9D3CB23B356789FA2A72` |
| `projeto-dashboard/tests/browser-evidence.json` | `FFB2829583B67EA6ABD37276FEE50F79EF2BFCAE575B5B772DCD1B93B18E57A3` |
| `projeto-dashboard/relatorios/rodada-04/construtor.md` | `C2FB59C4B29EA54237A8625925939665A70F5E4A1FE636285FC518B97734762E` |

## O que foi conferido e alterações nos testes

- Li `relatorios/rodada-04/test-plan.md`, `validacao-base.md`, o relatório do Construtor e a implementação entregue. Não alterei `site/`, dados ou outro arquivo de produto.
- Atualizei apenas `tests/test_dashboard.py` e `tests/browser_test.js`. O tester calcula totais em centavos a partir do CSV, confere os três totais mensais (R$ 6.235,00/62, R$ 6.181,00/56 e R$ 7.643,00/62), rankings de produtos e o exemplo conhecido da rodada 03. O helper de Chromium agora também lê o CSV diretamente e usa as linhas-fonte como oráculo para os recortes.
- Mantive a tabela integral: a verificação inicial continua exigindo todas as **180 linhas**, na ordem da fonte. Não adaptei essa expectativa para paginação, pois o produto entregue não pagina a tabela.
- Acrescentei as verificações de comparação mensal dos três cards, tendência SVG/pontos acessíveis, Pareto individual e acumulado, seleção de mês, filtros de categoria/cidade/mês/produto isolados e combinados, drill-down por mouse e teclado, estado vazio por combinação realmente inexistente, limpeza, hover, ausência de `NaN`/`Infinity`/`undefined`, foco/ordem de teclado, responsividade e console/runtime.
- Busca e ordenação não existem na interface entregue; paginação também não existe e o Construtor documenta a opção de manter a tabela integral. Não alego cobertura desses recursos não implementados nem reduzi critérios aplicáveis.

## Comandos, resultados e evidências

- `& .\.venv\Scripts\python.exe projeto-dashboard\preparar_dados.py` — **OK**. Validou/exportou 180 registros, total de R$ 20.059,00 e ticket de R$ 111,44. O hash de `data.json` depois da preparação é idêntico ao hash antes/declarado na entrega (`5E7451...EA120`); o CSV preserva o hash confirmado.
- `& .\.venv\Scripts\python.exe -m unittest discover -s projeto-dashboard\tests -v` — **OK: 7 testes passaram, 0 falharam e 0 foram ignorados**. Incluiu teste de browser real Chromium; execução final durou 5,217 s.
- `node --check projeto-dashboard\site\app.js` e `node --check projeto-dashboard\tests\browser_test.js` — **OK**. A verificação de sintaxe dos dois arquivos também integra a suíte Python.
- Integridade/dados: 180 linhas, esquema de nove colunas, tipos, ausência de valores vazios, IDs e linhas únicos, valor de venda igual a quantidade × preço; JSON corresponde à fonte; política de duplicata conflitante continua testada como erro sem descarte. Recálculo independente confirma R$ 20.059,00 e agrupamentos; fonte e `data.json` preservados.
- Browser: comparação independente das linhas filtradas com cards, gráfico mensal SVG, gráficos de categoria/cidade, Pareto e IDs/contagem da tabela. Foram exercitados filtros isolados e a combinação cidade + categoria + produto + mês; vazio real `Santos + Livros + Estojo`; e botão de limpar restaurando as 180 linhas.
- Browser: comparações dos três KPIs conferidas para março vs. fevereiro, fevereiro vs. janeiro e janeiro sem base anterior; limites sem valores inválidos. Drill-down por clique em categoria, produto Pareto e ponto do SVG; teclado via Tab nos links/botão/quatro filtros, setas/Enter no select, Enter no produto e Espaço no ponto mensal. Hover real do gráfico confirmado.
- Browser: viewports **390×844** e **1440×900**, sem overflow horizontal involuntário, grades e SVG válidos, tabela alcançável por teclado. Nenhum erro JavaScript/console (`runtimeErrors: []`). Evidência detalhada e reproduzível: `projeto-dashboard/tests/browser-evidence.json`, `result: PASS`.
- A primeira execução encontrou problemas no próprio teste novo (valor anterior não passado ao cálculo percentual, clique no centro vazio da caixa SVG e foco de teclado continuado no último select). Corrigi somente o oráculo/helper/ação nos testes, sem alterar critérios do produto; a execução completa final passou. Nenhum defeito reproduzível de produto foi encontrado ou encaminhado ao Construtor.

## Situação e status

Todas as verificações executáveis deste escopo passaram; não há teste pendente por falta de ferramenta. Busca/ordenação/paginação são recursos ausentes e não fazem parte desta entrega, conforme descrito acima. A revisão independente continua a cargo do Revisor; este relatório não representa aprovação conjunta nem atualiza o status final do projeto.

**APROVADO — escopo do Tester para os hashes desta rodada.**
