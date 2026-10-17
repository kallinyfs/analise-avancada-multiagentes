# Relatório do Construtor — rodada 06

## Escopo e versão

Alteração restrita a `projeto-dashboard/site/index.html`, `styles.css` e `app.js`. Não há commit Git. A paleta e o gráfico foram atualizados sem tocar CSV ou JSON.

| Arquivo | SHA-256 |
|---|---|
| `projeto-dashboard/site/index.html` | `C56E1BC5C51461F3915F63655BA2769BD5DE8F164553BA1ADBFBA17932E71AC9` |
| `projeto-dashboard/site/styles.css` | `81AF6D284BA7F19048DF1D2DF5981F28AF297C74763F25699E2843FC0C380E50` |
| `projeto-dashboard/site/app.js` | `F3CC1B0C2A20445F0CD5F7E8631A6E62E7DD98F9621A352DF22A8C8D3A02A9C8` |
| `papelaria_limpa.csv` (preservado) | `698BB401D35C644C9B4F9414B96D3236E02EBCA6E0878CDD51C12B6EF259C2AD` |
| `projeto-dashboard/site/data.json` (preservado) | `5E7451C1984123516BB68D17070053F237BE47CFD616E6B40E113533444EA120` |
| `projeto-dashboard/tests/browser-evidence.json` (regenerado pela suíte) | `10E9D4E054908E72B21BAB7872AAEF9BBEC901B4B3BB906E469DB8B245882C46` |

## Alterações

- Removido do HTML o disclaimer estático sobre lucro. Resumos dos gráficos continuam em `.resumo-grafico`, agora com `.somente-leitor`; o gráfico mensal também referencia seu resumo com `aria-describedby`.
- A contagem positiva continua no `role="status"` e é ocultada visualmente com `.somente-leitor`. A classe sai quando o resultado é vazio, mantendo a mensagem vazia visível; erros também permanecem visíveis.
- Aplicada a paleta Coolors `#231942 #5E548E #9F86C0 #BE95C4 #E0B1CB`, com fundo de papel claro, linhas discretas e contraste escuro para texto.
- Tendência mensal SVG agora tem escala Y monetária, ticks e grades, área suave, curva, valores junto aos pontos, pontos selecionáveis por mouse/teclado e tooltip `<title>`. A seleção sem vendas de março mantém o ponto `0 vendas` e seus dados acessíveis; não há projeções.
- Filtros, cálculos, comparações, rankings, tabela, links e estados vazios foram mantidos.

## Verificações do Construtor

- `node --check projeto-dashboard/site/app.js` — **OK**.
- `& .\.venv\Scripts\python.exe -m unittest discover -s projeto-dashboard\tests -v` — **6 passaram, 1 falhou**. A falha do teste de navegador compara o hover com a cor antiga azul `rgb(234, 245, 250)`; com a paleta solicitada, o fundo atual é `rgb(243, 237, 246)`. O teste confirmou que o hover continua ativo e com deslocamento. Não alterei o teste para acomodar a nova paleta. As verificações de interface posteriores àquela asserção ficam **PENDENTES**.
- A execução da suíte regenerou `tests/browser-evidence.json` (hash atual acima); nenhum código de teste foi editado. CSV e `data.json` mantêm os hashes anteriores.
- Nenhum Tester ou Revisor foi chamado e nenhuma revisão independente foi executada, conforme instrução explícita do usuário.

## Status

**BLOQUEADO** para verificação integral: o teste existente exige o hover da paleta anterior, incompatível com a nova paleta solicitada, e a revisão independente não foi executada por instrução do usuário. A correção visual foi implementada; não declaro aprovação conjunta.
