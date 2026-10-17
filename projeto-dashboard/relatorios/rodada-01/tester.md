# Relatório do Tester — rodada 01

## Versão examinada

Não há commit. SHA-256 completo dos arquivos relevantes:

| Arquivo | SHA-256 |
|---|---|
| `papelaria_limpa.csv` | `698BB401D35C644C9B4F9414B96D3236E02EBCA6E0878CDD51C12B6EF259C2AD` |
| `projeto-dashboard/preparar_dados.py` | `A22BC49C16B6D48D6CCDD04F8581315491B791C889DF8041A374BB410D441A01` |
| `projeto-dashboard/README.md` | `8EAF5CA24BF91E3BAC74772B19BF78B5548872BF307C6DBB78F8A77FF64FC3E0` |
| `projeto-dashboard/site/index.html` | `44BF6A7864863B02A4E1FF3489763916E3DC8FEA4FF1D7242E06884F24027301` |
| `projeto-dashboard/site/styles.css` | `66C4D1559F84B0E27F904F93D35F2445C8DE3869B0E2D7AB466D564BAD4EBB5A` |
| `projeto-dashboard/site/app.js` | `B949E92264A67A73D6F9D5397812F95F8C2A9EDDC522144D1AC3857F2C0BF98A` |
| `projeto-dashboard/site/data.json` | `5E7451C1984123516BB68D17070053F237BE47CFD616E6B40E113533444EA120` |
| `projeto-dashboard/tests/test_dashboard.py` | `5AFAB19E7B761988BE332A866DDAB65D402C6CF4A9A9B813D6A1C37D8041067A` |
| `projeto-dashboard/tests/browser_test.js` | `7F2DAF18D65614624DC7A09BA480C647294BA125291D5F7077E791809C66FAAF` |

## Conferências e evidências

- Criados testes próprios em `projeto-dashboard/tests/test_dashboard.py` e `browser_test.js`. Não alterei arquivos de produto nem o relatório do Construtor. Evidência detalhada de viewport e console: `projeto-dashboard/tests/browser-evidence.json`.
- Comando: `& .\.venv\Scripts\python.exe -m unittest discover -s projeto-dashboard\tests -v` (PowerShell, na raiz). Resultado: **6 testes passaram; 1 falhou**.
- Passaram: hash do CSV original igual ao prefixo registrado pelo Construtor; esquema e 180 linhas; tipos, valores não vazios, IDs exclusivos, ausência de linhas repetidas e cálculo quantidade × preço; política de rejeição de ID duplicado sem descartar linhas; correspondência linha a linha entre CSV e JSON; totais e agrupamentos recalculados independentemente em centavos; exemplo pequeno conhecido; HTTP 200 para HTML/CSS/JS/JSON e 404 para recurso inexistente; `node --check` do JavaScript do site.
- Chromium headless real estava instalado e foi usado via CDP. Filtros de categoria (teclado), cidade isolada, combinação, resultado vazio e limpar (clique) atualizaram KPIs, gráficos e tabela conforme esperado; sem `NaN`, `Infinity` ou `undefined`. A seleção vazia foi exercitada removendo uma combinação somente de uma cópia dos dados em memória do navegador, pois as nove combinações reais existem; CSV e JSON não foram modificados.
- Viewports conferidos: 390×844 (grade de indicadores/filtros/gráficos: 1 coluna; sem overflow horizontal) e 1440×900 (3/2/2 colunas; sem overflow). Tab percorreu botão e filtro; setas/Enter selecionaram opção; botão devolveu o foco ao filtro.
- **Falha:** o navegador solicita automaticamente `/favicon.ico`; a pasta do site responde 404 e registra erro no console. Não é erro de execução do `app.js`, mas é recurso ausente observado no carregamento HTTP real. Encaminhar ao **Construtor** para disponibilizar um favicon ou evitar a requisição e então repetir a suíte.
- Pendência: execução integral limpa depende da correção do favicon e nova execução desta suíte. Revisão independente continua pendente.

## Status

**REPROVADO** — testes funcionais e de dados passaram, mas o teste de navegador detectou o recurso ausente `/favicon.ico`. Não aprovo a versão até a correção e reexecução.
