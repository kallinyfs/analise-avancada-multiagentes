# Relatório do Construtor — rodada 11

## Escopo e hashes

Sem commit Git neste diretório. Alterado somente o estilo do título principal em `projeto-dashboard/site/styles.css`; não foram feitos commit ou push.

| Arquivo | SHA-256 após a rodada |
|---|---|
| `projeto-dashboard/site/styles.css` | `B91928349217C58372FA9CC17D8BDF25CBC228D8CCAA3A297D1E577F5077504D` |
| `projeto-dashboard/site/index.html` (não alterado) | `BA3A0AB1C8D778F4A845973808FF75240F60A9B926F1BCE088E1627F1C6EA0F5` |
| `projeto-dashboard/site/app.js` (não alterado) | `F3CC1B0C2A20445F0CD5F7E8631A6E62E7DD98F9621A352DF22A8C8D3A02A9C8` |

## Alteração

- Atualizada apenas a regra `.hero-texto h1` para priorizar `Segoe Script`, `Brush Script MT` e `Lucida Handwriting`, seguida de `cursive`; todas são fontes locais, sem CDN ou import remoto.
- Mantidos tamanho, altura compacta e legibilidade; aplicado peso moderado, espaçamento quase neutro e sombra discreta.
- Texto/etiquetas removidos na rodada 10 não foram reintroduzidos. Restante do cabeçalho, paleta, ilustração, animações e reduced-motion foram preservados.

## Verificações e limites

- Verificação estática com Python/`HTMLParser` e asserções CSS: **OK** — pilha de fontes local, dimensionamento compacto, título e dois links preservados, nenhum import remoto, CSS balanceado e reduced-motion presente.
- Verificação visual/browser da fonte efetivamente disponível no sistema: **PENDENTE**.
- A falha antiga da suíte continua registrada na rodada 06: uma asserção espera a cor azul antiga do hover. A suíte não foi executada nesta rodada e não é declarada aprovada.
- Nenhum Tester ou Revisor foi acionado, conforme solicitado.

## Status

**BLOQUEADO** para validação visual: as verificações estáticas passaram, mas a renderização da fonte depende das fontes instaladas e do navegador; a falha de teste antiga permanece conhecida.
