# Relatório final — dashboard da papelaria

## Status atual: **BLOQUEADO / VERIFICAÇÃO PENDENTE**

O fluxo de relatórios preserva as rodadas anteriores em `rodada-01/` a `rodada-12/`. As alterações visuais das rodadas 06–12 foram feitas somente pelo Construtor, conforme solicitação do usuário; não houve Tester/Revisor nessas rodadas.

## Conteúdo da entrega

- Dashboard estático em `site/`: filtros por categoria, cidade, mês e produto; KPIs e comparações mensais; gráficos de categoria/cidade, evolução mensal e ranking cumulativo de produtos; tabela e links de perfil.
- Tema delicado de papelaria com a paleta `#231942 #5E548E #9F86C0 #BE95C4 #E0B1CB`, ilustrações SVG animadas no cabeçalho e fonte local Matcha World no título. O movimento respeita `prefers-reduced-motion`.
- Processo multiagentes documentado em `AGENTS.md`; skills em `.opencode/skills/`; histórico de relatórios em Markdown.

## Dados e privacidade

Os CSVs originais continuam fora do Git. O `site/data.json` preparado é publicado para alimentar o dashboard no Render, com os 180 registros de venda (IDs, datas, cidade, produto, pagamento e valor), conforme autorização explícita da proprietária. A análise confirmada anteriormente totaliza R$ 20.059,00; valor vendido não é lucro. Coloque os CSVs localmente para reproduzir a preparação.

## Testes e limitações

- Em `rodada-06`, a suíte executada pelo Construtor teve **6 aprovados e 1 falha**: o teste de hover ainda espera a cor azul antiga (`rgb(234, 245, 250)`), incompatível com a paleta lilás atual. Os testes não foram alterados.
- As rodadas 07–12 fizeram apenas verificações estáticas do Construtor; testes visuais em navegador permanecem pendentes.
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

Abra <http://localhost:8000>. A pasta publicável é `projeto-dashboard/site/`; `data.json` está versionado para o deploy autorizado.

Para deploy estático no Render, importe o Blueprint definido em `render.yaml`; o diretório publicado é `projeto-dashboard/site/`.
