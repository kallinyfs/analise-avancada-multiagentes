# Relatório do Construtor — rodada 04

## Versão examinada

Não há commit neste workspace. SHA-256 dos arquivos finais:

| Arquivo | SHA-256 |
|---|---|
| `projeto-dashboard/site/index.html` | `4F22A12FAEAC6ED84F257FB4EC3993B0D060B0CBE3261A1C37D0BE68EB04D5CA` |
| `projeto-dashboard/site/styles.css` | `31A3CEC0C9A995304115D53798A6478372D2D33806EF19FACA665A378D65295F` |
| `projeto-dashboard/site/app.js` | `0DA907DA89BD110070BCCD489F8AA86F2B30FDFE980C6685F09244EDE8CD7A46` |
| `papelaria_limpa.csv` (preservado) | `698BB401D35C644C9B4F9414B96D3236E02EBCA6E0878CDD51C12B6EF259C2AD` |
| `projeto-dashboard/site/data.json` (preservado) | `5E7451C1984123516BB68D17070053F237BE47CFD616E6B40E113533444EA120` |

## Construído

- Mantidos HTML/CSS/JavaScript vanilla, paleta azul/branca, links GitHub/LinkedIn, KPIs de vendas, gráficos por categoria/cidade, tabela e layout responsivo.
- Acrescentados filtros de mês e produto; botão de limpar redefine os quatro filtros. Os filtros atualizam KPIs, rankings, tendência e tabela conjuntamente.
- Adicionada tendência mensal em SVG nativo, com pontos selecionáveis por mouse/teclado e comparação dos três KPIs com o mês anterior. Sem base anterior ou com base zero, a variação não é dividida por zero.
- Adicionado ranking de produtos com participação acumulada. Linhas de categoria, cidade e produto são filtros interativos, acessíveis por teclado, com rótulos acessíveis; pontos mensais incluem título e descrição.
- Mantida a tabela completa para cada recorte, sem paginação, para preservar todos os registros e a correspondência com a implementação/testes anteriores. Estados vazios permanecem explícitos; nenhuma alteração em dados ou arquivos de teste.

## Comandos e resultados

- `node --check projeto-dashboard/site/app.js` — **OK**, sintaxe JavaScript válida.
- `Get-FileHash -Algorithm SHA256 projeto-dashboard/site/index.html, projeto-dashboard/site/styles.css, projeto-dashboard/site/app.js` — hashes registrados acima.
- `Get-FileHash -Algorithm SHA256 papelaria_limpa.csv, projeto-dashboard/site/data.json` — hashes confirmam que CSV e dados preparados foram preservados.
- Suíte automatizada, interação real no navegador e revisão independente: **PENDENTES**, a cargo do Tester e Revisor. Não executei nem afirmo aprovação desses testes.

## Encaminhamento e status

**APROVADO — entrega do Construtor.** Os testes desta versão e a revisão independente permanecem **PENDENTES**; não há aprovação conjunta nesta etapa.
