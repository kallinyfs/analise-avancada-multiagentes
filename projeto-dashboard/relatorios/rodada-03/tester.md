# Relatório do Tester — rodada 03

## Versão examinada

Não há commit nem repositório Git neste workspace. Os hashes SHA-256 identificam a versão testada após a execução final:

| Arquivo | SHA-256 |
|---|---|
| `papelaria_limpa.csv` (fonte) | `698BB401D35C644C9B4F9414B96D3236E02EBCA6E0878CDD51C12B6EF259C2AD` |
| `projeto-dashboard/README.md` | `22DA09ECD2E3182331C6ACBFD6C4ECDE1C334D9085705794A18D152485861F60` |
| `projeto-dashboard/preparar_dados.py` | `A22BC49C16B6D48D6CCDD04F8581315491B791C889DF8041A374BB410D441A01` |
| `projeto-dashboard/site/index.html` | `7448E6DCD5874E74B02CDF675E024AED2A907117E64A7B8CD377A01139CB060D` |
| `projeto-dashboard/site/favicon.svg` | `DE0C252194628730B54D2EE4A3573BC50147360D5D9F425CBC9640696120B4EE` |
| `projeto-dashboard/site/styles.css` | `66C4D1559F84B0E27F904F93D35F2445C8DE3869B0E2D7AB466D564BAD4EBB5A` |
| `projeto-dashboard/site/app.js` | `B949E92264A67A73D6F9D5397812F95F8C2A9EDDC522144D1AC3857F2C0BF98A` |
| `projeto-dashboard/site/data.json` | `5E7451C1984123516BB68D17070053F237BE47CFD616E6B40E113533444EA120` |
| `projeto-dashboard/tests/test_dashboard.py` | `5AFAB19E7B761988BE332A866DDAB65D402C6CF4A9A9B813D6A1C37D8041067A` |
| `projeto-dashboard/tests/browser_test.js` | `7F2DAF18D65614624DC7A09BA480C647294BA125291D5F7077E791809C66FAAF` |
| `projeto-dashboard/tests/browser-evidence.json` (regenerado nesta rodada) | `2E32CF6CEA043EFBF8359584BE0477C288CF1C067B1E11E5DA3448F3A18F9347` |

Desde a rodada-02, a única alteração persistente de produto/testes é `README.md`, conforme o relatório do Construtor; fonte, preparação, site, dados e testes mantêm os hashes da rodada-02. A execução regenerou `browser-evidence.json`; `data.json` permaneceu idêntico. Não editei produto nem testes.

## Comandos executados, resultados e evidências

- `& .\.venv\Scripts\python.exe projeto-dashboard\preparar_dados.py` — **OK**. Validou e exportou 180 registros; total vendido de R$ 20.059,00 e ticket médio de R$ 111,44.
- `& .\.venv\Scripts\python.exe -m unittest discover -s projeto-dashboard\tests -v` — **OK: 7 testes passaram; nenhum falhou ou foi ignorado**. Python 3.15.0, Node v24.21.0 e Chromium disponíveis. Incluiu integridade e esquema do CSV, tipos/ausências/IDs e regra contra duplicatas, JSON preparado, recálculo independente de totais e agrupamentos, exemplo pequeno conhecido, HTTP, sintaxe JavaScript e interação em navegador real.
- Os testes independentes confirmaram 180 registros sem ausências nem IDs/linhas duplicados; total de R$ 20.059,00; agrupamentos de categoria e cidade; correspondência dos registros e indicadores. A política de duplicatas foi verificada com fixture: erro sem remoção de linhas.
- O teste HTTP da suíte verificou HTML, CSS, JavaScript, JSON e resposta 404 para arquivo ausente. Verificação HTTP adicional serviu `/`, `/styles.css`, `/app.js`, `/data.json` e `/favicon.svg`: todos **200**; `/not-found`: **404** esperado.
- O teste real em Chromium verificou indicadores, os dois gráficos e tabela contra os dados preparados; categoria por teclado, cidade isolada, combinação, seleção sem resultados e limpar filtros. Sem `NaN`, `Infinity` ou `undefined`, e sem erros de runtime/console. Viewports 390×844 e 1440×900 sem overflow, com grades e filtros no número esperado de colunas. Evidência: `projeto-dashboard/tests/browser-evidence.json` (`result: PASS`, `runtimeErrors: []`).
- A interface tem controles `<select>` nativos com rótulos associados (`Categoria` e `Cidade`) e foco visível; o teste de navegador percorreu por teclado o botão e o filtro de categoria, selecionou opção com setas/Enter e conferiu restauração do foco. O filtro de cidade é também `<select>` nativo e foi exercitado isoladamente e combinado.
- `Get-FileHash -Algorithm SHA256 ...` — hashes acima conferidos depois da execução. O CSV original manteve o hash registrado; o resultado preparado também manteve seu hash.

## Problemas e pendências

- Nenhuma falha de produto/teste encontrada para encaminhar ao Construtor. Os testes obrigatórios executáveis foram realizados; nada ficou **PENDENTE** nesta rodada de testes.
- A validação independente pela skill `validate-data` não faz parte desta execução e continua bloqueada por ausência do arquivo referido no histórico. A revisão final independente permanece sob responsabilidade do Revisor; este relatório não representa aprovação conjunta.

## Status

**APROVADO — escopo do Tester para a versão identificada pelos hashes acima.** Os sete testes passaram, incluindo interação real no navegador, filtros, teclado e responsividade. Este status não substitui a revisão do Revisor nem resolve o bloqueio da skill `validate-data`.
