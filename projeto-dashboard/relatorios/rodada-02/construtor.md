# Relatório do Construtor — rodada 02

## Versão examinada

Não há commit neste diretório. SHA-256 completo dos arquivos relevantes:

| Arquivo | SHA-256 |
|---|---|
| `papelaria_limpa.csv` (fonte, inalterada) | `698BB401D35C644C9B4F9414B96D3236E02EBCA6E0878CDD51C12B6EF259C2AD` |
| `projeto-dashboard/README.md` | `9F1A835F83C996D1C49855B097D28DD12B5CFA80395DF12DDBC93C0A46203CCB` |
| `projeto-dashboard/preparar_dados.py` | `A22BC49C16B6D48D6CCDD04F8581315491B791C889DF8041A374BB410D441A01` |
| `projeto-dashboard/site/index.html` | `7448E6DCD5874E74B02CDF675E024AED2A907117E64A7B8CD377A01139CB060D` |
| `projeto-dashboard/site/favicon.svg` | `DE0C252194628730B54D2EE4A3573BC50147360D5D9F425CBC9640696120B4EE` |
| `projeto-dashboard/site/styles.css` | `66C4D1559F84B0E27F904F93D35F2445C8DE3869B0E2D7AB466D564BAD4EBB5A` |
| `projeto-dashboard/site/app.js` | `B949E92264A67A73D6F9D5397812F95F8C2A9EDDC522144D1AC3857F2C0BF98A` |
| `projeto-dashboard/site/data.json` | `5E7451C1984123516BB68D17070053F237BE47CFD616E6B40E113533444EA120` |
| `projeto-dashboard/tests/test_dashboard.py` (inalterado) | `5AFAB19E7B761988BE332A866DDAB65D402C6CF4A9A9B813D6A1C37D8041067A` |
| `projeto-dashboard/tests/browser_test.js` (inalterado) | `7F2DAF18D65614624DC7A09BA480C647294BA125291D5F7077E791809C66FAAF` |
| `projeto-dashboard/tests/browser-evidence.json` (evidência atualizada ao executar a suíte) | `E74A72C6E9308A0F6FFA7D53F341D2C5BCB93264CD78C0AC148245EB2C248234` |

## Alteração e destino

- Corrigido o favicon ausente com um ícone SVG local em `projeto-dashboard/site/favicon.svg`, referenciado por `site/index.html`. Assim, o navegador carrega o recurso local em vez de solicitar `/favicon.ico` e gerar 404.
- README atualizado para identificar o ícone como parte do conteúdo da pasta publicável `projeto-dashboard/site/`.
- O CSV e os arquivos-fonte dos testes não foram editados. A execução da suíte atualizou sua evidência gerada `tests/browser-evidence.json`.
- Destino da solução: `projeto-dashboard/site/`, incluído junto do site estático para hospedagem.

## Comandos, resultados e evidências

- `& .\.venv\Scripts\python.exe projeto-dashboard\preparar_dados.py` — **OK**; validou e gerou `site/data.json` com 180 registros, total vendido de R$ 20.059,00 e ticket médio de R$ 111,44. O hash do JSON permaneceu igual ao da rodada 01.
- `& .\.venv\Scripts\python.exe -m unittest discover -s projeto-dashboard\tests -v` — **OK**, 7 testes passaram, incluindo HTTP e Chromium real; evidência atual em `projeto-dashboard/tests/browser-evidence.json`, com `result: PASS` e `runtimeErrors: []`.
- `Get-FileHash -Algorithm SHA256 ...` — hashes acima; confirma que o CSV e os arquivos-fonte dos testes permanecem inalterados.

## Encaminhamento e status

- A correção removeu o 404 de favicon na verificação de navegador executada. O Tester precisa reexecutar e registrar a suíte inteira sobre esta versão, incluindo a confirmação independente da evidência do navegador; não editar `tester.md` nesta etapa.
- Revisão independente final continua pendente.

**APROVADO — correção do Construtor nesta rodada.** Aprovação conjunta do projeto permanece pendente do Tester e do Revisor.
