# Análise avançada de vendas — fluxo multiagentes

Projeto de análise de vendas de papelaria com preparação em Python/pandas, dashboard estático e relatórios de execução. O fluxo de trabalho está em [`AGENTS.md`](AGENTS.md); os relatórios Markdown estão em [`projeto-dashboard/relatorios/`](projeto-dashboard/relatorios/).

## O que está incluído

- `projeto-dashboard/`: preparação dos dados, dashboard estático e testes.
- `projeto-dashboard/relatorios/`: relatórios históricos em Markdown. Artefatos de evidência JSON não são publicados.
- `.opencode/skills/`: skills `explore-data`, `data-visualization` e `validate-data` usadas no fluxo.
- `graficos.py`, `resumo.md` e `verificacao.md`: análise exploratória e conferência inicial.

## Dados e privacidade

Os CSVs de entrada e limpeza ficam fora do Git. O `projeto-dashboard/site/data.json` preparado é publicado para que o dashboard funcione no Render; ele contém os 180 registros de venda (IDs, datas, cidades, produtos, pagamentos e valores), conforme autorização explícita da proprietária. Para reproduzir a preparação, coloque `vendas_papelaria.csv` e `papelaria_limpa.csv` localmente na raiz; os CSVs continuam ignorados pelo Git.

## Preparar e testar (PowerShell/Windows)

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe projeto-dashboard\preparar_dados.py
.\.venv\Scripts\python.exe -m unittest discover -s projeto-dashboard\tests -v
```

O teste de interação precisa também de Node.js e Chromium (Google Chrome ou Microsoft Edge). Sem eles, a verificação de navegador não é executada.

## Abrir o dashboard localmente

Depois de preparar os dados:

```powershell
.\.venv\Scripts\python.exe -m http.server 8000 --directory projeto-dashboard\site
```

Abra <http://localhost:8000>. A pasta publicável é `projeto-dashboard/site/`; o `data.json` versionado acompanha o deploy. Quando os dados locais mudarem, regenere o JSON, revise-o e faça commit conscientemente, pois ele contém registros individuais.

## Deploy no Render

O arquivo [`render.yaml`](render.yaml) configura um site estático cujo diretório publicado é `projeto-dashboard/site`. Importe este repositório no Render usando **New → Blueprint**; o `data.json` versionado será servido junto com a página.

## Skills disponíveis

- `.opencode/skills/explore-data/SKILL.md`
- `.opencode/skills/data-visualization/SKILL.md`
- `.opencode/skills/validate-data/SKILL.md`
