# Relatório final — dashboard da papelaria

## Status atual: **BLOQUEADO / VERIFICAÇÃO PENDENTE**

O fluxo de relatórios preserva as rodadas anteriores em `rodada-01/` a `rodada-08/`. A versão atual tem alterações visuais do Construtor nas rodadas 06–08. Não houve Tester ou Revisor nessas alterações visuais, conforme solicitação do usuário.

## Conteúdo da entrega

- Dashboard estático em `site/`: filtros por categoria, cidade, mês e produto; KPIs e comparações mensais; gráficos de categoria/cidade, evolução mensal e ranking cumulativo de produtos; tabela e links de perfil.
- Tema delicado de papelaria com a paleta `#231942 #5E548E #9F86C0 #BE95C4 #E0B1CB` e ilustrações SVG animadas no cabeçalho. O movimento respeita `prefers-reduced-motion`.
- Processo multiagentes documentado em `AGENTS.md`; skills em `.opencode/skills/`; histórico de relatórios em Markdown.

## Dados e privacidade

Os CSVs e `site/data.json` não são versionados para não publicar registros de venda individuais. A análise local confirmada anteriormente tem 180 vendas de janeiro a março de 2026, total vendido de R$ 20.059,00; valor vendido não é lucro. Coloque os arquivos CSV localmente para reproduzir preparação e testes.

## Testes e limitações

- Em `rodada-06`, a suíte executada pelo Construtor teve **6 aprovados e 1 falha**: o teste de hover ainda espera a cor azul antiga (`rgb(234, 245, 250)`), incompatível com a paleta lilás atual. Os testes não foram alterados.
- As rodadas 07 e 08 fizeram verificações estáticas do Construtor; testes visuais em navegador permanecem pendentes.
- Não declarar a versão atual aprovada até atualizar/validar a asserção visual com autorização do usuário e executar a suíte aplicável.

## Skills utilizadas

`explore-data`, `data-visualization` e `validate-data` estão disponíveis em `.opencode/skills/` e foram utilizadas nesta execução do projeto. O arquivo de instruções do ambiente menciona também o caminho `.agents/skills/`, que não existe neste workspace.

## Comandos locais (PowerShell)

Na raiz do workspace:

```powershell
.\.venv\Scripts\python.exe projeto-dashboard\preparar_dados.py
.\.venv\Scripts\python.exe -m unittest discover -s projeto-dashboard\tests -v
.\.venv\Scripts\python.exe -m http.server 8000 --directory projeto-dashboard\site
```

Abra <http://localhost:8000>. A pasta publicável é `projeto-dashboard/site/`; o JSON local precisa ser gerado antes de publicar.
