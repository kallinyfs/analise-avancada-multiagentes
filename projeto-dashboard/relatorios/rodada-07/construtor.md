# Relatório do Construtor — rodada 07

## Escopo e versão

Sem commit Git neste diretório. Nesta rodada, o único arquivo alterado foi `projeto-dashboard/site/styles.css`. A ilustração inline já existia em `index.html`; ela e os links foram preservados sem edição.

| Arquivo | SHA-256 observado após a rodada |
|---|---|
| `projeto-dashboard/site/index.html` (não alterado nesta rodada) | `BA3A0AB1C8D778F4A845973808FF75240F60A9B926F1BCE088E1627F1C6EA0F5` |
| `projeto-dashboard/site/styles.css` (alterado) | `29472034A6B7FCBD5B0C66BAA4518FAEF2EC6DA925DD02693B449485BC0F272C` |
| `projeto-dashboard/site/app.js` (não alterado; hash mantido da rodada 06) | `F3CC1B0C2A20445F0CD5F7E8631A6E62E7DD98F9621A352DF22A8C8D3A02A9C8` |

## Alterações

- Estilizada a ilustração SVG inline existente de livro/caderno, lápis, clipe e régua com a paleta atual, preenchimentos suaves e traços claros.
- Acrescentadas animações delicadas, defasadas entre os objetos, para flutuação, balanço e desenho do clipe.
- Em telas estreitas, a ilustração é reduzida e o texto reserva espaço para evitar sobreposição; em larguras intermediárias ela fica oculta para não disputar espaço com o título ou os links. Em desktop amplo fica posicionada entre o título e o painel de links.
- Os SVGs seguem decorativos (`aria-hidden="true"`); a arte não recebe interação. Links, conteúdo e funções existentes foram preservados.
- `prefers-reduced-motion: reduce` remove as animações da ilustração e reduz transições.
- Não foram alterados `index.html`, `app.js`, testes, dados nem relatórios anteriores nesta rodada.

## Verificações e limites

- Verificação estática ad hoc com Python do ambiente virtual e `HTMLParser`: **OK** — 3 SVGs encontrados, ilustração principal com `aria-hidden="true"`, 2 links externos preservados.
- Asserções CSS no mesmo comando: **OK** — chaves balanceadas e presença das regras das peças, quatro keyframes, breakpoints e regra `prefers-reduced-motion`.
- Hashes SHA-256 obtidos com `Get-FileHash -Algorithm SHA256`.
- Não executei a suíte de testes, não usei navegador e não fiz verificação visual manual em resoluções reais; portanto, overflow, composição e animação no navegador permanecem **PENDENTES**.
- A rodada 06 registra 6 testes passando e 1 falhando porque uma asserção ainda espera o hover azul antigo. Essa falha permanece conhecida; testes não foram editados e a suíte não é declarada aprovada.
- Não houve execução de Tester ou Revisor, conforme instrução explícita do usuário.

## Status

**BLOQUEADO** para aprovação visual integral: mudanças CSS e verificações estruturais concluídas, mas as verificações em navegador estão pendentes e há a falha de teste já registrada na rodada 06.
