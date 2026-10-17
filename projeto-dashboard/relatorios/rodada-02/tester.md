# Relatório do Tester — rodada 02

## Versão examinada

Não há commit neste diretório. Os hashes SHA-256 da fonte, do produto e dos arquivos de teste conferem com os registrados pelo Construtor na rodada 02. A suíte atualizou `browser-evidence.json`, por isso seu hash atual difere daquele relatório.

| Arquivo | SHA-256 |
|---|---|
| `papelaria_limpa.csv` | `698BB401D35C644C9B4F9414B96D3236E02EBCA6E0878CDD51C12B6EF259C2AD` |
| `projeto-dashboard/README.md` | `9F1A835F83C996D1C49855B097D28DD12B5CFA80395DF12DDBC93C0A46203CCB` |
| `projeto-dashboard/preparar_dados.py` | `A22BC49C16B6D48D6CCDD04F8581315491B791C889DF8041A374BB410D441A01` |
| `projeto-dashboard/site/index.html` | `7448E6DCD5874E74B02CDF675E024AED2A907117E64A7B8CD377A01139CB060D` |
| `projeto-dashboard/site/favicon.svg` | `DE0C252194628730B54D2EE4A3573BC50147360D5D9F425CBC9640696120B4EE` |
| `projeto-dashboard/site/styles.css` | `66C4D1559F84B0E27F904F93D35F2445C8DE3869B0E2D7AB466D564BAD4EBB5A` |
| `projeto-dashboard/site/app.js` | `B949E92264A67A73D6F9D5397812F95F8C2A9EDDC522144D1AC3857F2C0BF98A` |
| `projeto-dashboard/site/data.json` | `5E7451C1984123516BB68D17070053F237BE47CFD616E6B40E113533444EA120` |
| `projeto-dashboard/tests/test_dashboard.py` | `5AFAB19E7B761988BE332A866DDAB65D402C6CF4A9A9B813D6A1C37D8041067A` |
| `projeto-dashboard/tests/browser_test.js` | `7F2DAF18D65614624DC7A09BA480C647294BA125291D5F7077E791809C66FAAF` |
| `projeto-dashboard/tests/browser-evidence.json` (gerado nesta execução) | `4953F46C0A2BC2DF236994A00DBF3A20FE76DA4BBE693AB987CE35F1F6463008` |

## Conferências, comandos e evidências

- Suíte completa, na raiz do projeto: `& .\.venv\Scripts\python.exe -m unittest discover -s projeto-dashboard\tests -v` — **7 testes passaram**, nenhum falhou ou foi ignorado. Inclui `node --check` e Chromium headless real via CDP.
- Dados: hash integral do CSV original preservado; esquema com 9 colunas e 180 linhas, sem ausentes ou IDs/linhas duplicados; tipos e relação quantidade × preço conferidos; JSON corresponde aos registros do CSV. Totais e agrupamentos foram recalculados independentemente em centavos (total R$ 20.059,00) e um exemplo pequeno conhecido também passou. A política de ID repetido é rejeitar com erro, sem descartar linhas.
- HTTP/recursos: o teste da suíte serviu HTML, CSS, JS e JSON por HTTP, e confirmou 404 para recurso inexistente. Verificação adicional direta: `GET /favicon.svg` — **HTTP 200**, `image/svg+xml`, 236 bytes. O favicon local está referenciado no HTML; carregamento no Chromium terminou sem erros de runtime ou console (`runtimeErrors: []`).
- Interface: `browser_test.js` comparou KPIs, os dois gráficos e as linhas da tabela com os registros esperados em cada estado. Passaram categoria via teclado, cidade isolada, combinação dos filtros, seleção vazia e limpar filtros; não houve `NaN`, `Infinity` ou `undefined`. A seleção vazia usa cópia de dados somente em memória, sem alterar CSV/JSON.
- Acessibilidade e tamanhos: teste real de teclado alcançou o botão, o filtro de categoria, selecionou opção com seta/Enter e confirmou foco visível; limpar devolveu o foco ao primeiro filtro. O seletor de cidade também é um controle nativo `<select>`, rotulado por `<label>`. Viewport 390×844: uma coluna em cartões/filtros/gráficos, seletor com 332 px e sem overflow. Viewport 1440×900: 3/2/2 colunas e sem overflow. Área rolável da tabela está focável.
- Evidência do navegador: `projeto-dashboard/tests/browser-evidence.json` (`result: PASS`, viewports mobile/desktop registrados, casos de filtros registrados, `runtimeErrors: []`).
- Não alterei arquivos do produto nem os testes nesta rodada; apenas a execução regenerou a evidência JSON.

## Bloqueio separado de skill e encaminhamento

- **BLOQUEADO (skill):** `.agents/skills/validate-data/SKILL.md` não existe neste workspace. Portanto, esta execução de testes não substitui a validação pela skill e não afirmo que ela foi utilizada. O coordenador deve disponibilizar a skill e executar essa etapa antes de declarar aprovação conjunta.
- Não foram encontradas falhas de produto ou de teste para encaminhar ao Construtor. Revisão independente permanece pendente.

## Status

**APROVADO — escopo do Tester para a versão identificada pelos hashes acima.** Os sete testes obrigatórios executáveis passaram, incluindo navegador, HTTP, dados, correspondência visual, filtros, teclado e tamanhos de tela. Isto não representa aprovação conjunta: validação pela skill `validate-data` está **BLOQUEADA** por arquivo ausente e a revisão do Revisor continua **PENDENTE**.
